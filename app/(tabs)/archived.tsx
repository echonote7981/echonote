import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, RefreshControl, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView, Pressable, AppState, AppStateStatus } from 'react-native';
import ActionDetailsModal from '../components/ActionDetailsModal';
import { meetingsApi, actionsApi, ArchivedMeeting, Action } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dateUtils from '../utils/dateUtils';
import timeUtils from '../utils/timeUtils';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../styles/theme';
import globalStyles from '../styles/globalStyles';
import { useRouter } from 'expo-router';
import TranscriptText from '../components/TranscriptText';
import { useTranslation } from 'react-i18next';

type ArchiveTab = 'meetings' | 'tasks';

export default function ArchivedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [archivedMeetings, setArchivedMeetings] = useState<ArchivedMeeting[]>([]);
  const [archivedActions, setArchivedActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('meetings');
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMeeting, setSelectedMeeting] = useState<ArchivedMeeting | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [meetingHighlights, setMeetingHighlights] = useState<string[]>([]);
  const [transcriptModalVisible, setTranscriptModalVisible] = useState(false);
  const [highlightsModalVisible, setHighlightsModalVisible] = useState(false);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cleanupStatus, setCleanupStatus] = useState<{ running: boolean, lastRun: Date | null, result: any | null }>({ 
    running: false, 
    lastRun: null, 
    result: null 
  });

  useEffect(() => {
    // Initial data load
    loadData();
    
    // Create a focus detector without continuous polling
    // We'll track the last time we loaded data instead
    const lastLoadTime = Date.now();
    
    // Create a simpler mechanism to check if we need to refresh
    const checkFocusState = () => {
      // Only reload if it's been more than 30 seconds since last load
      const now = Date.now();
      if (now - lastLoadTime > 30000) { // 30 seconds
        console.log('Archives refreshing after inactivity');
        loadData();
      }
    };
    
    // Add app state change listener to detect when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkFocusState();
      }
    })
    
    // Check if we should run auto-cleanup
    const checkForAutoCleanup = async () => {
      // Get the last cleanup time from storage, if available
      const lastCleanupStr = await AsyncStorage.getItem('lastArchivedMeetingCleanup');
      let shouldRunCleanup = false;
      
      if (!lastCleanupStr) {
        // Never cleaned up before, so run it
        shouldRunCleanup = true;
      } else {
        // Check if it's been at least 24 hours since last cleanup
        const lastCleanup = new Date(lastCleanupStr);
        const now = new Date();
        const hoursSinceLastCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60);
        shouldRunCleanup = hoursSinceLastCleanup >= 24;
      }
      
      if (shouldRunCleanup) {
        // Run the cleanup in the background
        cleanupOldArchivedMeetings(true);
      }
    };
    
    checkForAutoCleanup();
    
    // Clean up app state listener
    return () => {
      subscription.remove();
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load archived meetings
      const meetings = await meetingsApi.getArchived();
      
      // Log the meetings data to check if highlights are included
      console.log('Archived meetings loaded:', meetings.length);
      if (meetings.length > 0) {
        console.log('First meeting sample:', {
          id: meetings[0].id,
          title: meetings[0].title,
          highlightsExist: meetings[0].highlights ? true : false,
          highlightsCount: meetings[0].highlights?.length || 0
        });
      }
      
      // Sort meetings based on current sort order
      const sortedMeetings = sortMeetings(meetings, sortOrder);
      setArchivedMeetings(sortedMeetings);

      // Load archived and completed actions
      const actions = await actionsApi.getArchived();
      setArchivedActions(actions);
    } catch (error) {
      console.error('Error loading archived data:', error);
      Alert.alert('Error', 'Failed to load archived data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to sort meetings by date
  const sortMeetings = (meetings: ArchivedMeeting[], order: 'newest' | 'oldest') => {
    return [...meetings].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  
  // Toggle sort order and re-sort meetings
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(newOrder);
    setArchivedMeetings(sortMeetings(archivedMeetings, newOrder));
  };
  
  // Handle restoring an archived meeting
  const handleRestoreMeeting = async (meeting: ArchivedMeeting) => {
    try {
      await meetingsApi.restoreArchivedMeeting(meeting.id);
      Alert.alert('Success', 'Meeting has been restored');
      // Refresh the list
      loadData();
      setOptionsModalVisible(false);
    } catch (error) {
      console.error('Failed to restore meeting:', error);
      Alert.alert('Error', 'Failed to restore meeting. Please try again.');
    }
  };
  
  // Handle long press to show action menu
  const handleLongPress = (meeting: ArchivedMeeting) => {
    setSelectedMeeting(meeting);
    setShowActionMenu(true);
  };

  // Handle deleting an archived meeting with client-side fallback
  const handleDeleteMeeting = async () => {
    if (!selectedMeeting) return;
    
    // The API service now handles errors silently, so we don't need
    // to wrap this in a try/catch block anymore
    await meetingsApi.deleteArchivedMeeting(selectedMeeting.id);
    handleDeleteSuccess();
  };
  
  // Handle successful deletion (whether real or simulated)
  const handleDeleteSuccess = () => {
    if (!selectedMeeting) return;
    
    // Remove the meeting from local state
    setArchivedMeetings(prevMeetings => 
      prevMeetings.filter(meeting => meeting.id !== selectedMeeting.id)
    );
    
    // Close all modals
    setShowDeleteConfirm(false);
    setShowActionMenu(false);
    setTranscriptModalVisible(false);
    
    // Show success message
    Alert.alert('Success', 'Meeting has been removed from your archived list');
  };
  
  // Handle deleting from transcript modal
  const handleDeleteFromTranscript = () => {
    if (!selectedMeeting) return;
    setTranscriptModalVisible(false);
    setShowDeleteConfirm(true);
  };
  
  // Handle viewing transcript
  const handleViewTranscript = () => {
    if (!selectedMeeting) return;
    setShowActionMenu(false);
    setTranscriptModalVisible(true);
  };
  
  // Navigate to meeting details
  const navigateToMeetingDetails = (meeting: ArchivedMeeting) => {
    // If the meeting has an originalMeetingId, use that for navigation
    const meetingId = meeting.originalMeetingId || meeting.id;
    router.push(`/meeting/${meetingId}`);
  };

  const onRefresh = async () => {
    console.log('Manual refresh triggered');
    setRefreshing(true);
    try {
      // Force clear any cached data to ensure fresh fetch
      await AsyncStorage.removeItem('archivedMeetingsCache');
      await loadData();
      console.log('Manual refresh completed');
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  /**
   * Clean up archived meetings older than 15 days
   * @param silent If true, will not show alerts to the user (for background cleanup)
   */
  const cleanupOldArchivedMeetings = async (silent: boolean = false) => {
    if (cleanupStatus.running) return;
    
    try {
      setCleanupStatus(prev => ({ ...prev, running: true }));
      
      if (!silent) {
        Alert.alert(
          'Cleaning up old archives',
          'Removing archived meetings older than 15 days. This may take a moment...',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
      // Run the cleanup
      const result = await meetingsApi.cleanupOldArchivedMeetings(15);
      const now = new Date();
      
      // Save the cleanup time
      await AsyncStorage.setItem('lastArchivedMeetingCleanup', now.toISOString());
      
      // Update state
      setCleanupStatus({ running: false, lastRun: now, result });
      
      // Show results if not silent
      if (!silent && result.deletedCount > 0) {
        Alert.alert(
          'Cleanup Complete',
          `Successfully removed ${result.deletedCount} archived meetings that were older than 15 days.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else if (!silent) {
        Alert.alert(
          'Cleanup Complete',
          'No archived meetings were old enough to be removed.',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
      // Refresh the data to update the UI
      loadData();
    } catch (error) {
      console.error('Error during automated cleanup:', error);
      if (!silent) {
        Alert.alert(
          'Cleanup Error',
          'There was an error cleaning up old archived meetings. Please try again later.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setCleanupStatus(prev => ({ ...prev, running: false }));
    }
  };

  const toggleExpand = (meetingId: string) => {
    if (expandedMeeting === meetingId) {
      setExpandedMeeting(null);
    } else {
      setExpandedMeeting(meetingId);
    }
  };

  // Loading indicator
  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={globalStyles.loadingText}>Loading archived items...</Text>
      </SafeAreaView>
    );
  }

  // Render an archived meeting with expandable details and options
  const renderMeetingItem = ({ item }: { item: ArchivedMeeting }) => {
    const isExpanded = expandedMeeting === item.id;
    const hasTranscript = item.transcript && item.transcript.length > 0;

    return (
      <TouchableOpacity 
        onPress={() => toggleExpand(item.id)} 
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        style={globalStyles.itemCard}
        activeOpacity={0.7}
      >
        <View style={globalStyles.itemContent}>
          <View style={globalStyles.itemHeader}>
            <Text style={globalStyles.itemTitle}>{item.title}</Text>
            <Text style={globalStyles.itemDate}>
              {dateUtils.formatDate(new Date(item.date))}
            </Text>
          </View>

          {isExpanded && (
            <View style={globalStyles.expandedContent}>
              {item.duration && (
                <View style={globalStyles.detailRow}>
                  <MaterialIcons name="timer" size={20} color={theme.colors.textSecondary} />
                  <Text style={globalStyles.detailText}>
                    {timeUtils.formatDuration(item.duration)}
                  </Text>
                </View>
              )}
              
              {hasTranscript && (
                <>
                  <View style={globalStyles.detailRow}>
                    <MaterialIcons name="description" size={20} color={theme.colors.textSecondary} />
                    <Text style={globalStyles.detailText}>
                      {item.transcript!.length > 100 
                        ? item.transcript!.substring(0, 100) + '...' 
                        : item.transcript}
                    </Text>
                  </View>
                  
                  {/* View Full Transcript button - moved to bottom of transcript summary */}
                  {item.transcript && item.transcript.length > 100 && (
                    <View style={{ marginLeft: 24 }}>
                      <TouchableOpacity 
                        style={{ marginTop: 8, alignSelf: 'flex-start' }}
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent's onPress
                          setSelectedMeeting(item);
                          setTranscriptModalVisible(true);
                        }}
                      >
                        <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>View Full Transcript</Text>
                      </TouchableOpacity>
                      
                      {/* Delete button removed due to API endpoint not working - now using long press instead */}
                    </View>
                  )}
                </>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <View style={globalStyles.highlightsContainer}>
                  <Text style={globalStyles.highlightsTitle}>
                    Highlights:
                  </Text>
                  {item.highlights.map((highlight, index) => (
                    <Text 
                      key={index} 
                      style={globalStyles.highlight}
                    >
                      • {highlight}
                    </Text>
                  ))}
                </View>
              )}
              
              {/* Removed Options button */}
            </View>
          )}
          
          <View style={globalStyles.expandIndicator}>
            <MaterialIcons
              name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render an archived action item with appropriate status and details
  const renderActionItem = ({ item }: { item: Action }) => {
    // Ensure all items in this list are marked as archived for display purposes
    const displayItem = item.archived ? item : {...item, archived: true};
    
    // Determine status text based on action status and opened state
    let statusText = 'Unknown';
    
    if (displayItem.status === 'completed') {
      statusText = 'Completed';
    } else if (displayItem.status === 'pending') {
      if (displayItem.hasBeenOpened) {
        statusText = 'In Progress'; // Correctly handle pending+opened as In Progress
      } else {
        statusText = 'Pending';
      }
    }
    
    // Split title into heading and content if it contains double newlines
    // This matches the display format in the Actions tab
    let heading = displayItem.title;
    let content = '';
    
    if (displayItem.title && displayItem.title.includes('\n\n')) {
      const parts = displayItem.title.split('\n\n');
      heading = parts[0];
      content = parts.slice(1).join('\n\n');
    }
    
    return (
      <TouchableOpacity
        style={globalStyles.itemCard}
        activeOpacity={0.7}
        onPress={() => setSelectedAction(displayItem)}
      >
        <View style={globalStyles.itemContent}>
          <View style={globalStyles.itemHeader}>
            <View style={globalStyles.statusContainer}>
              <Text style={[
                globalStyles.statusText,
                (displayItem.status === 'in_progress' || (displayItem.status === 'pending' && displayItem.hasBeenOpened)) && globalStyles.inProgressText,
                displayItem.status === 'completed' && globalStyles.completedText,
              ]}>
                {statusText}
              </Text>
              
              {displayItem.priority && (
                <View style={[
                  globalStyles.priorityFlag,
                  displayItem.priority === 'High' && globalStyles.highPriorityFlag,
                  displayItem.priority === 'Medium' && globalStyles.mediumPriorityFlag,
                  displayItem.priority === 'Low' && globalStyles.lowPriorityFlag,
                ]}>
                  <Text style={globalStyles.priorityText}>{displayItem.priority}</Text>
                </View>
              )}
            </View>
            <Text style={globalStyles.itemDate}>
              {displayItem.completedAt 
                ? `Completed: ${new Date(displayItem.completedAt).toLocaleDateString()}`
                : displayItem.dueDate 
                  ? `Due: ${new Date(displayItem.dueDate).toLocaleDateString()}`
                  : 'No date'}
            </Text>
          </View>
          
          <Text style={globalStyles.itemTitle}>{heading}</Text>
          
          {content ? (
            <Text style={globalStyles.itemText}>
              {content}
            </Text>
          ) : null}
          
          {displayItem.notes && (
            <Text style={globalStyles.itemNotes} numberOfLines={2}>
              {displayItem.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Tab buttons for navigation between archived meetings and actions */}
      <View style={globalStyles.header}>
        <View style={[globalStyles.filterButtons, { marginRight: 20 }]}>
          <TouchableOpacity 
            style={[globalStyles.filterButton, activeTab === 'meetings' && globalStyles.activeFilterButton]}
            onPress={() => setActiveTab('meetings')}
          >
            <Text style={[globalStyles.filterButtonText, activeTab === 'meetings' && globalStyles.activeFilterButtonText]}>
              Meetings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[globalStyles.filterButton, activeTab === 'tasks' && globalStyles.activeFilterButton]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[globalStyles.filterButtonText, activeTab === 'tasks' && globalStyles.activeFilterButtonText]}>
              Tasks
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Sort and cleanup buttons - only show for meetings tab */}
        {activeTab === 'meetings' && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{
                padding: 10,
                borderRadius: 4,
                backgroundColor: theme.colors.surface,
              }}
              onPress={toggleSortOrder}
            >
              <MaterialIcons 
                name={sortOrder === 'newest' ? 'arrow-downward' : 'arrow-upward'} 
                size={18} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info message about auto-cleanup */}
      <View style={{ paddingHorizontal: 16, marginTop: 5, marginBottom: 10, borderBottomWidth: 0 }}>
        <Text style={{ 
          fontSize: 12, 
          color: theme.colors.textSecondary, 
          fontStyle: 'italic',
          textAlign: 'center' 
        }}>
          {activeTab === 'meetings' 
            ? 'Meetings are automatically removed after 15 days' 
            : 'Completed tasks are automatically removed after 15 days'}
        </Text>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'meetings' ? (
        archivedMeetings.length > 0 ? (
          <FlatList
            data={archivedMeetings}
            renderItem={renderMeetingItem}
            keyExtractor={item => item.id}
            contentContainerStyle={globalStyles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.textSecondary}
              />
            }
          />
        ) : (
          // Empty state for meetings
          <View style={globalStyles.emptyContainer}>
            <MaterialIcons name="archive" size={64} color={theme.colors.textSecondary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 }}>No Archived Meetings</Text>
            <Text style={globalStyles.emptyText}>
              Meetings you archive will appear here.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 }}
              onPress={onRefresh}
            >
              <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '600' }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        archivedActions.length > 0 ? (
          <FlatList
            data={archivedActions}
            renderItem={renderActionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={globalStyles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.textSecondary}
              />
            }
          />
        ) : (
          // Empty state for tasks
          <View style={globalStyles.emptyContainer}>
            <MaterialIcons name="check-circle" size={64} color={theme.colors.textSecondary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 }}>No Archived Tasks</Text>
            <Text style={globalStyles.emptyText}>
              Completed tasks will appear here.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 }}
              onPress={onRefresh}
            >
              <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '600' }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )
      )}
      
      {/* Full Transcript Modal */}
      <Modal
        visible={transcriptModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTranscriptModalVisible(false)}
      >
        <SafeAreaView style={globalStyles.container}>
          <View style={globalStyles.header}>
            <TouchableOpacity 
              style={globalStyles.iconButton}
              onPress={() => setTranscriptModalVisible(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[globalStyles.itemTitle, { textAlign: 'center' }]}>Full Transcript</Text>
            <TouchableOpacity 
              style={globalStyles.iconButton}
              onPress={handleDeleteFromTranscript}
            >
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {selectedMeeting?.transcript ? (
              <Text style={{ fontSize: 16, lineHeight: 24, color: theme.colors.textPrimary }}>
                {selectedMeeting.transcript}
              </Text>
            ) : (
              <Text style={globalStyles.emptyText}>No transcript available</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Meeting Options Modal */}
      <Modal
        visible={optionsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View 
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: '80%',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.textPrimary,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Meeting Options
            </Text>
            
            {/* View Highlights option - always visible */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
              onPress={async () => {
                setOptionsModalVisible(false);
                console.log('Opening highlights modal with meeting:', selectedMeeting?.id);
                
                // Detailed logging of the selected meeting's highlights
                if (selectedMeeting) {
                  console.log('Selected meeting details:', {
                    id: selectedMeeting.id,
                    title: selectedMeeting.title,
                    highlightsExist: selectedMeeting.highlights ? true : false,
                    highlightsCount: selectedMeeting.highlights?.length || 0,
                    highlightsData: selectedMeeting.highlights
                  });
                  
                  // For archived meetings, we'll just display the highlights directly
                  // without trying to fetch from the original meeting since it may no longer exist
                  if (selectedMeeting.highlights && Array.isArray(selectedMeeting.highlights)) {
                    console.log('Using highlights from archived meeting:', selectedMeeting.highlights);
                    setMeetingHighlights(selectedMeeting.highlights);
                  } else {
                    console.log('No highlights available in the archived meeting');
                    setMeetingHighlights([]);
                  }
                } else {
                  console.log('No meeting selected');
                  setMeetingHighlights([]);
                }
                
                setHighlightsModalVisible(true);
              }}
            >
              <MaterialIcons name="star" size={24} color={theme.colors.primary} />
              <Text style={{
                fontSize: 16,
                color: theme.colors.textPrimary,
                marginLeft: 12,
              }}>View Highlights</Text>
            </TouchableOpacity>
            
            {selectedMeeting?.transcript && (
              <TouchableOpacity 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
                onPress={() => {
                  setOptionsModalVisible(false);
                  setTranscriptModalVisible(true);
                }}
              >
                <MaterialIcons name="description" size={24} color={theme.colors.primary} />
                <Text style={{
                  fontSize: 16,
                  color: theme.colors.textPrimary,
                  marginLeft: 12,
                }}>View Full Transcript</Text>
              </TouchableOpacity>
            )}
            
            {/* Removed Restore Meeting functionality due to API 404 errors */}
            
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 0,
              }}
              onPress={() => {
                if (selectedMeeting) {
                  setShowDeleteConfirm(true);
                  setOptionsModalVisible(false);
                }
              }}
            >
              <MaterialIcons name="delete" size={24} color={theme.colors.error} />
              <Text style={{
                fontSize: 16,
                color: theme.colors.error,
                marginLeft: 12,
              }}>Delete Permanently</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                marginTop: 16,
                justifyContent: 'center',
                borderBottomWidth: 0,
              }}
              onPress={() => setOptionsModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                marginLeft: 12,
              }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Highlights Modal */}
      <Modal
        visible={highlightsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHighlightsModalVisible(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            padding: 16,
          }}
          activeOpacity={1}
          onPress={() => setHighlightsModalVisible(false)}
        >
          <View 
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 16,
              padding: 20,
              maxHeight: '80%',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.textPrimary,
              }}>
                Meeting Highlights
              </Text>
              <TouchableOpacity onPress={() => setHighlightsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {loadingHighlights ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16, color: theme.colors.textSecondary, fontSize: 16 }}>
                  Loading highlights...
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: '90%' }}>
                {meetingHighlights && meetingHighlights.length > 0 ? (
                  meetingHighlights.map((highlight, index) => (
                    <View key={index} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: index < (meetingHighlights.length || 0) - 1 ? 1 : 0, borderBottomColor: theme.colors.border }}>
                      <Text style={{ fontSize: 16, color: theme.colors.textPrimary, lineHeight: 22 }}>
                        • {highlight}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <MaterialIcons name="info-outline" size={40} color={theme.colors.textSecondary} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 8 }}>
                      No highlights available for this meeting.
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', opacity: 0.8 }}>
                      Highlights may not have been generated for this archived meeting.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={{
                backgroundColor: theme.colors.surface,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 16,
              }}
              onPress={() => setHighlightsModalVisible(false)}
            >
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showActionMenu}
        onRequestClose={() => setShowActionMenu(false)}
      >
        <Pressable
          style={globalStyles.actionModalOverlay}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={globalStyles.actionMenuContainer}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.textPrimary,
              marginBottom: 15,
              textAlign: 'center',
            }}>
              {selectedMeeting?.title}
            </Text>
            
            <View style={globalStyles.actionMenu}>
              {/* Delete Button */}
              <Pressable
                style={globalStyles.actionButton}
                onPress={() => {
                  setShowActionMenu(false);
                  setShowDeleteConfirm(true);
                }}
              >
                <MaterialIcons name="delete" size={24} color="#FF3B30" />
                <Text style={[globalStyles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
              </Pressable>
              
              {/* Cancel Button */}
              <Pressable
                style={[globalStyles.actionButton, { marginLeft: 10 }]}
                onPress={() => setShowActionMenu(false)}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Archived Action Details Modal */}
      {selectedAction && (
        <ActionDetailsModal
          visible={selectedAction !== null}
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          // Pass read-only prop to indicate this is archived and should be read-only
          readOnly={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable
          style={globalStyles.actionModalOverlay}
          onPress={() => setShowDeleteConfirm(false)}
        >
          <View style={globalStyles.confirmDialog}>
            <Text style={globalStyles.confirmTitle}>Delete Meeting</Text>
            <Text style={globalStyles.confirmMessage}>
              Are you sure you want to permanently delete this archived meeting? This action cannot be undone.
            </Text>
            <View style={globalStyles.confirmButtons}>
              <Pressable
                style={[globalStyles.confirmButton, globalStyles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[globalStyles.confirmButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[globalStyles.confirmButton, globalStyles.deleteButton]}
                onPress={handleDeleteMeeting}
              >
                <Text style={[globalStyles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
