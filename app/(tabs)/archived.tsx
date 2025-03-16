import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, RefreshControl, SafeAreaView, ActivityIndicator, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { meetingsApi, actionsApi, ArchivedMeeting, Action } from '../services/api';
import dateUtils from '../utils/dateUtils';
import timeUtils from '../utils/timeUtils';
import { MaterialIcons } from '@expo/vector-icons';
import commonStyles from '../styles/common';
import theme from '../styles/theme';

type ArchiveTab = 'meetings' | 'tasks';

export default function ArchivedScreen() {
  const [archivedMeetings, setArchivedMeetings] = useState<ArchivedMeeting[]>([]);
  const [archivedActions, setArchivedActions] = useState<Action[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('meetings');

  const loadArchived = async () => {
    try {
      setLoading(true);
      
      // Load archived meetings
      try {
        console.log('📋 Attempting to fetch archived meetings...');
        const meetingsData = await meetingsApi.getArchived();
        console.log(`✅ Retrieved ${meetingsData.length} archived meetings`);
        setArchivedMeetings(meetingsData);
      } catch (meetingError) {
        console.error('❌ Error fetching archived meetings:', meetingError);
        setArchivedMeetings([]);
      }
      
      // Load archived actions with enhanced error handling and logging
      try {  
        console.log('📋 Attempting to fetch archived actions...');
        let archivedActionsData: Action[] = [];
        
        try {
          console.log('📞 Calling actionsApi.getArchived()...');
          archivedActionsData = await actionsApi.getArchived();
          console.log(`📄 Raw archived actions data: ${JSON.stringify(archivedActionsData)}`);
        } catch (error) {
          console.error('❌ Error in primary archive fetch method:', error);
          // Try fallback: get all actions and filter
          try {
            console.log('🔄 Trying fallback: fetching all actions...');
            const allActions = await actionsApi.getAll();
            archivedActionsData = allActions.filter(action => 
              action.archived === true || 
              action.status === 'completed' // Show ALL completed tasks regardless of other flags
            );
            console.log(`🔢 Fallback found ${archivedActionsData.length} archived actions`);
          } catch (fallbackError) {
            console.error('❌ Fallback method also failed:', fallbackError);
          }
        }
        
        // Remove duplicate entries by using a Map with action IDs as keys
        const uniqueActionsMap = new Map();
        archivedActionsData.forEach(action => {
          uniqueActionsMap.set(action.id, action);
        });
        archivedActionsData = Array.from(uniqueActionsMap.values());
        
        // Sort actions by completedAt date (newest first)
        archivedActionsData.sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log(`✅ Final archived actions count: ${archivedActionsData.length}`);
        setArchivedActions(archivedActionsData);
      } catch (actionsError) {
        console.error('❌ Error processing archived actions:', actionsError);
        setArchivedActions([]);
      }
    } catch (error) {
      console.error('❌ Failed to load archived items:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArchived();
    setRefreshing(false);
  };

  useEffect(() => {
    loadArchived();
  }, []);

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedMeeting(expandedMeeting === id ? null : id);
  };

  const renderMeetingItem = ({ item }: { item: ArchivedMeeting }) => {
    const isExpanded = expandedMeeting === item.id;

    return (
      <Pressable 
        onPress={() => toggleExpand(item.id)} 
        style={commonStyles.meetingItem}
      >
        <View style={commonStyles.meetingHeader}>
          <View style={commonStyles.titleContainer}>
            <Text style={commonStyles.title}>
              {item.title}
            </Text>
            <Text style={commonStyles.date}>
              {dateUtils.formatDate(new Date(item.date))}
            </Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#FFFFFF"
          />
        </View>

        {isExpanded && (
          <View style={commonStyles.expandedContent}>
            {item.duration && (
              <View style={commonStyles.detailRow}>
                <MaterialIcons name="timer" size={20} color="#FFFFFF" />
                <Text style={commonStyles.detailText}>
                  {timeUtils.formatDuration(item.duration)}
                </Text>
              </View>
            )}
            
            {item.transcript && (
              <View style={commonStyles.detailRow}>
                <MaterialIcons name="description" size={20} color="#FFFFFF" />
                <Text style={commonStyles.detailText}>
                  {item.transcript.length > 100 
                    ? item.transcript.substring(0, 100) + '...' 
                    : item.transcript}
                </Text>
              </View>
            )}

            {item.highlights && item.highlights.length > 0 && (
              <View style={commonStyles.highlightsContainer}>
                <Text style={commonStyles.highlightsTitle}>
                  Highlights:
                </Text>
                {item.highlights.map((highlight, index) => (
                  <Text 
                    key={index} 
                    style={commonStyles.highlight}
                  >
                    • {highlight}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  // Render an archived action item with appropriate status and details
  const renderActionItem = ({ item }: { item: Action }) => {
    // Ensure all items in this list are marked as archived for display purposes
    const displayItem = item.archived ? item : {...item, archived: true};
    
    // Determine status text based on action status and opened state
    let statusText = 'Unknown';
    let statusColor = '#999';
    
    if (displayItem.status === 'completed') {
      statusText = 'Completed';
      statusColor = '#4CAF50'; // Green
    } else if (displayItem.status === 'pending') {
      if (displayItem.hasBeenOpened) {
        statusText = 'In Process'; // Correctly handle pending+opened as In Process
        statusColor = '#2196F3'; // Blue
      } else {
        statusText = 'Not Started';
        statusColor = '#FFC107'; // Yellow
      }
    }
    
    return (
      <Pressable style={commonStyles.meetingItem}>
        <View style={commonStyles.meetingHeader}>
          <View style={commonStyles.titleContainer}>
            <Text style={commonStyles.title}>{displayItem.title}</Text>
            <Text style={commonStyles.date}>
              {displayItem.completedAt ? dateUtils.formatDate(new Date(displayItem.completedAt)) : 'No completion date'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        {/* Display notes if available */}
        {displayItem.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{displayItem.notes}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Tab buttons for navigation between archived meetings and actions */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'meetings' && styles.activeTabButton]}
          onPress={() => setActiveTab('meetings')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'meetings' && styles.activeTabText]}>Meetings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'tasks' && styles.activeTabButton]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'tasks' && styles.activeTabText]}>Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'meetings' ? (
        <FlatList
          data={archivedMeetings}
          renderItem={renderMeetingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={commonStyles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      ) : (
        <FlatList
          data={archivedActions}
          renderItem={renderActionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={commonStyles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  // New styles for archived action items
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  notesLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  notesText: {
    color: '#fff',
    fontSize: 14,
  },
});
