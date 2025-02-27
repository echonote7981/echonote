import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, Text, Pressable, RefreshControl, Platform, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal, GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { meetingsApi, Meeting } from '../services/api';
import meetingsStyles from '../styles/meetings';

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

  const loadMeetings = async () => {
    try {
      console.log('Loading meetings...');
      const data = await meetingsApi.getAll();
      console.log('Meetings loaded:', data);
      setMeetings(data);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  };

  const handlePressIn = (meeting: Meeting, event: GestureResponderEvent) => {
    pressStartTime.current = Date.now();
    touchStartY.current = event.nativeEvent.pageY;
    isScrolling.current = false;
    
    longPressTimeout.current = setTimeout(() => {
      if (!isScrolling.current) {
        setSelectedMeeting(meeting);
        setShowActionMenu(true);
      }
    }, 3000);
  };

  const handlePressOut = (meeting: Meeting) => {
    const pressDuration = Date.now() - pressStartTime.current;
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    
    handlePress(meeting, pressDuration);
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (!isScrolling.current) {
      const moveDistance = Math.abs(event.nativeEvent.pageY - touchStartY.current);
      if (moveDistance > 10) {
        isScrolling.current = true;
      }
    }
  };

  const handlePress = (meeting: Meeting, pressDuration: number) => {
    if (pressDuration < 2000 && !isScrolling.current && !showActionMenu) {
      router.push({
        pathname: "/meeting/[id]",
        params: { id: meeting.id }
      });
    }
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

  const renderStatus = (status: Meeting['status']) => (
    <View style={meetingsStyles.statusContainer}>
      <Text style={[meetingsStyles.meetingStatus, { color: getStatusColor(status) }]}>
        {status}
      </Text>
      {status === 'processing' && (
        <ActivityIndicator 
          size="small" 
          color={getStatusColor(status)}
          style={meetingsStyles.statusSpinner}
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
      onPressIn={(e) => handlePressIn(item, e)}
      onPressOut={() => handlePressOut(item)}
      onTouchMove={(e) => {
        if (!isScrolling.current) {
          const moveDistance = Math.abs(e.nativeEvent.pageY - touchStartY.current);
          if (moveDistance > 10) {
            isScrolling.current = true;
            if (longPressTimeout.current) {
              clearTimeout(longPressTimeout.current);
            }
          }
        }
      }}
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

  // Load meetings when screen comes into focus
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
