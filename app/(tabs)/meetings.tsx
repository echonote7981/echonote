import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, Text, Pressable, RefreshControl, Platform, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal, GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { meetingsApi, Meeting } from '../services/api';
import meetingsStyles from '../styles/meetings';

// Time interval for polling in ms (5 seconds)
const POLLING_INTERVAL = 5000;

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout>();
  const pressStartTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const router = useRouter();
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const isFocused = useRef<boolean>(false);

  const loadMeetings = async () => {
    try {
      console.log('Loading meetings...');
      const data = await meetingsApi.getAll();
      console.log('Meetings loaded:', data);
      setMeetings(data);
      return data;
    } catch (error) {
      console.error('Failed to load meetings:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  };

  // Simple press event to open meeting details
  const handlePress = (meeting: Meeting) => {
    router.push({
      pathname: "/meeting/[id]",
      params: { id: meeting.id }
    });
  };
  
  // Long press to show action menu
  const handleLongPress = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowActionMenu(true);
  };

  const handleArchive = async () => {
    if (!selectedMeeting) return;
    try {
      await meetingsApi.archiveMeeting(selectedMeeting.id);
      setShowActionMenu(false);
      setSelectedMeeting(null);
      loadMeetings();
    } catch (error) {
      Alert.alert('Error', 'Failed to archive meeting');
    }
  };

  const handleDelete = async () => {
    if (!selectedMeeting) return;
    try {
      await meetingsApi.deleteMeeting(selectedMeeting.id);
      setShowDeleteConfirm(false);
      setSelectedMeeting(null);
      loadMeetings();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete meeting');
    }
  };

  const checkMeetingStatus = async (meetingId: string) => {
    try {
      const meeting = await meetingsApi.getById(meetingId);
      if (meeting) {
        return meeting;
      }
    } catch (error) {
      console.error(`Failed to check status of meeting ${meetingId}:`, error);
    }
    return null;
  };

  const startPollingProcessingMeetings = useCallback(async () => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }

    if (!isFocused.current) return;

    try {
      const processingMeetings = meetings.filter(meeting => meeting.status === 'processing');
      
      if (processingMeetings.length === 0) {
        console.log('No processing meetings to check');
        return;
      }
      
      console.log(`Checking status for ${processingMeetings.length} processing meetings`);
      
      let updatedAny = false;
      
      for (const meeting of processingMeetings) {
        const updatedMeeting = await checkMeetingStatus(meeting.id);
        
        if (updatedMeeting && updatedMeeting.status !== 'processing') {
          console.log(`Meeting ${meeting.id} status changed from processing to ${updatedMeeting.status}`);
          updatedAny = true;
        }
      }
      
      if (updatedAny) {
        await loadMeetings();
      }
    } catch (error) {
      console.error('Error in polling:', error);
    } finally {
      if (isFocused.current) {
        pollingTimer.current = setTimeout(startPollingProcessingMeetings, POLLING_INTERVAL);
      }
    }
  }, [meetings]);

  const renderActionMenu = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showActionMenu}
      onRequestClose={() => setShowActionMenu(false)}
    >
      <Pressable
        style={meetingsStyles.modalOverlay}
        onPress={() => setShowActionMenu(false)}
      >
        <View style={meetingsStyles.actionMenuContainer}>
          <View style={meetingsStyles.actionMenu}>
            <Pressable
              style={meetingsStyles.actionButton}
              onPress={handleArchive}
            >
              <MaterialIcons name="archive" size={24} color="#007AFF" />
              <Text style={meetingsStyles.actionButtonText}>Archive</Text>
            </Pressable>
            <Pressable
              style={[meetingsStyles.actionButton, { marginLeft: 10 }]}
              onPress={() => {
                setShowActionMenu(false);
                setShowDeleteConfirm(true);
              }}
            >
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
              <Text style={[meetingsStyles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  const renderDeleteConfirm = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteConfirm}
      onRequestClose={() => setShowDeleteConfirm(false)}
    >
      <Pressable
        style={meetingsStyles.modalOverlay}
        onPress={() => setShowDeleteConfirm(false)}
      >
        <View style={meetingsStyles.confirmDialog}>
          <Text style={meetingsStyles.confirmTitle}>Delete Meeting</Text>
          <Text style={meetingsStyles.confirmMessage}>
            Are you sure you want to delete this meeting? This action cannot be undone.
          </Text>
          <View style={meetingsStyles.confirmButtons}>
            <Pressable
              style={[meetingsStyles.confirmButton, meetingsStyles.cancelButton]}
              onPress={() => setShowDeleteConfirm(false)}
            >
              <Text style={[meetingsStyles.confirmButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[meetingsStyles.confirmButton, meetingsStyles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={[meetingsStyles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'processed':
        return '#4CAF50';
      case 'processing':
        return '#FFC107';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Meeting['status']) => {
    switch (status) {
      case 'processed':
        return 'Ready';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const renderStatus = (status: Meeting['status']) => (
    <View style={meetingsStyles.statusContainer}>
      <Text style={[meetingsStyles.meetingStatus, { color: getStatusColor(status) }]}>
        {getStatusText(status)}
      </Text>
      {status === 'processing' && (
        <ActivityIndicator 
          size="small" 
          color={getStatusColor(status)}
          style={meetingsStyles.statusSpinner}
        />
      )}
      {status === 'processed' && (
        <MaterialIcons 
          name="check-circle" 
          size={16} 
          color={getStatusColor(status)} 
          style={meetingsStyles.statusIcon}
        />
      )}
      {status === 'failed' && (
        <MaterialIcons 
          name="error" 
          size={16} 
          color={getStatusColor(status)} 
          style={meetingsStyles.statusIcon}
        />
      )}
    </View>
  );

  const renderItem = ({ item }: { item: Meeting }) => (
    <Pressable
      style={({ pressed }) => [
        meetingsStyles.meetingCard,
        pressed && { opacity: 0.7 }
      ]}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={2000}
    >
      <View style={meetingsStyles.meetingHeader}>
        <Text style={meetingsStyles.meetingTitle}>{item.title}</Text>
        {renderStatus(item.status)}
      </View>
      <View style={meetingsStyles.meetingDetails}>
        <View style={meetingsStyles.detailItem}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={meetingsStyles.detailText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={meetingsStyles.detailItem}>
          <MaterialIcons name="calendar-today" size={16} color="#666" />
          <Text style={meetingsStyles.detailText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      {item.highlights && item.highlights.length > 0 && (
        <View style={meetingsStyles.highlightsContainer}>
          <Text style={meetingsStyles.highlightsTitle}>Highlights:</Text>
          {item.highlights.slice(0, 2).map((highlight, index) => (
            <Text key={index} style={meetingsStyles.highlight}>• {highlight}</Text>
          ))}
          {item.highlights.length > 2 && (
            <Text style={meetingsStyles.moreHighlights}>
              +{item.highlights.length - 2} more...
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );

  useFocusEffect(
    useCallback(() => {
      console.log('Meetings screen focused - loading meetings');
      isFocused.current = true;
      
      loadMeetings().then(loadedMeetings => {
        if (loadedMeetings.some(meeting => meeting.status === 'processing')) {
          startPollingProcessingMeetings();
        }
      });
      
      return () => {
        isFocused.current = false;
        if (pollingTimer.current) {
          clearTimeout(pollingTimer.current);
          pollingTimer.current = null;
        }
      };
    }, [startPollingProcessingMeetings])
  );

  useEffect(() => {
    if (isFocused.current && meetings.some(meeting => meeting.status === 'processing')) {
      if (!pollingTimer.current) {
        startPollingProcessingMeetings();
      }
    }
  }, [meetings, startPollingProcessingMeetings]);

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <SafeAreaView style={meetingsStyles.container}>
      <FlatList
        data={meetings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={meetingsStyles.listContent}
        scrollEventThrottle={16}
      />
      {renderActionMenu()}
      {renderDeleteConfirm()}
    </SafeAreaView>
  );
}
