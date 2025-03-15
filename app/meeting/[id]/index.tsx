import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, LayoutAnimation } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { meetingsApi, actionsApi } from '../../services/api';
import { useEffect, useState, useCallback } from 'react';
import { Meeting, Action } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import DetailSection from '../../components/DetailSection';
import TranscriptText from '../../components/TranscriptText';
import SeeMoreLink from '../../components/SeeMoreLink';
import ActionItemModal from '../../components/ActionItemModal';
import { MaterialIcons } from '@expo/vector-icons';
import timeUtils from '../../utils/timeUtils';
import transcriptAnalysis from '../../utils/transcriptAnalysis';
import { StyleSheet } from 'react-native';
import { Alert } from 'react-native';

const MAX_VISIBLE_LINES = 5;

const getPriorityStyle = (priority: Action['priority']) => {
  switch (priority) {
    case 'High':
      return styles.high;
    case 'Medium':
      return styles.medium;
    case 'Low':
      return styles.low;
    default:
      return {};
  }
};

const getStatusStyle = (status: Action['status']) => {
  switch (status) {
    case 'pending':
      return styles.pending;
    case 'completed':
      return styles.completed;
    default:
      return {};
  }
};

export default function MeetingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | undefined>();
  const [showAllActions, setShowAllActions] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [movedToPending, setMovedToPending] = useState<Set<string>>(new Set());

  const processTranscript = useCallback(async (transcript: string) => {
    setProcessingTranscript(true);
    try {
      const extractedActions = transcriptAnalysis.extractActionItems(transcript);
      
      // Create action items in the database
      const createdActions = await Promise.all(
        extractedActions.map(action => 
          actionsApi.create({
            ...action,
            meetingId: id as string,
            title: action.title || '',
            details: action.details || '',
            priority: action.priority || 'Medium',
            status: 'not_reviewed', // Start with empty status
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default due date: 1 week
          })
        )
      );
      
      setActions(prevActions => [...prevActions, ...createdActions]);
    } catch (error) {
      console.error('Failed to process transcript:', error);
    } finally {
      setProcessingTranscript(false);
    }
  }, [id]);

  const handleAddAction = () => {
    setSelectedAction(undefined);
    setActionModalVisible(true);
  };

  const handleEditAction = async (action: Action) => {
    try {
      // If the action is in not_reviewed status, mark it as opened
      if (action.status === 'not_reviewed' && !action.hasBeenOpened) {
        // Update hasBeenOpened flag
        await actionsApi.update(action.id, { hasBeenOpened: true });
        
        // Update local state
        setActions(prevActions =>
          prevActions.map(a =>
            a.id === action.id ? { ...a, hasBeenOpened: true } : a
          )
        );
      }
      
      // Open the action modal
      setSelectedAction(action);
      setActionModalVisible(true);
    } catch (error) {
      console.error('Failed to mark action as opened:', error);
    }
  };

  const handleSaveAction = async (actionData: Partial<Action>) => {
    try {
      if (actionData.id) {
        // Update existing action
        const updatedAction = await actionsApi.update(actionData.id, actionData);
        setActions(prevActions =>
          prevActions.map(a => (a.id === updatedAction.id ? updatedAction : a))
        );
      } else {
        // Create new action with not_reviewed status to keep it in the same state
        const newAction = await actionsApi.create({
          meetingId: id as string,
          title: actionData.title || '',
          details: actionData.details || '',
          dueDate: actionData.dueDate || new Date().toISOString(),
          priority: actionData.priority || 'Medium',
          status: 'not_reviewed', // Changed from 'pending' to 'not_reviewed'
          notes: actionData.notes,
        });
        setActions(prevActions => [...prevActions, newAction]);
      }
    } catch (error) {
      console.error('Failed to save action:', error);
    }
  };

  const handleDeleteAction = async (action: Action) => {
    try {
      await actionsApi.delete(action.id);
      setActions(prevActions => prevActions.filter(a => a.id !== action.id));
    } catch (error) {
      console.error('Failed to delete action:', error);
    }
  };

  const handleToggleStatus = async (action: Action) => {
    try {
      let newStatus = action.status;
      
      // Handle different status transitions
      if (action.status === 'completed') {
        // Move from completed back to pending
        newStatus = 'pending';
      } else if (action.status === 'not_reviewed') {
        // Move from not_reviewed to pending (Start Working)
        newStatus = 'pending';
      }
      
      if (newStatus !== action.status) {
        // Update the action status and mark as opened
        await actionsApi.update(action.id, { 
          status: newStatus,
          hasBeenOpened: true 
        });
        
        // Update the local state
        setActions(prevActions =>
          prevActions.map(a =>
            a.id === action.id ? { ...a, status: newStatus, hasBeenOpened: true } : a
          )
        );
        
        // Show feedback when moving from not_reviewed to pending
        if (action.status === 'not_reviewed' && newStatus === 'pending') {
          Alert.alert('Success', 'Action item moved to Pending in Actions tab');
        } else {
          Alert.alert('Success', 'Action item moved to Pending Actions');
        }
      }
    } catch (error) {
      console.error('Failed to update action status:', error);
      Alert.alert('Error', 'Failed to update action status. Please try again.');
    }
  };

  const handleMarkAsReviewed = async (actionId: string) => {
    try {
      // Update the action status to 'pending' to move it to Actions tab
      await actionsApi.update(actionId, { status: 'pending' });
      
      // Update the local state
      setActions(prevActions =>
        prevActions.map(a =>
          a.id === actionId ? { ...a, status: 'pending' } : a
        )
      );

      // Show feedback to user
      Alert.alert('Success', 'Action item moved to Pending Actions');
    } catch (error) {
      console.error('Failed to mark action as reviewed:', error);
      Alert.alert('Error', 'Failed to update action status. Please try again.');
    }
  };

  useEffect(() => {
    const loadMeetingData = async () => {
      try {
        const meetingData = await meetingsApi.getById(id as string);
        setMeeting(meetingData);
        
        // Load existing actions
        const existingActions = await actionsApi.getByMeeting(id as string);
        setActions(existingActions);

        // If there's a transcript but no actions yet, process it
        if (meetingData?.transcript && existingActions.length === 0) {
          await processTranscript(meetingData.transcript);
        }
      } catch (error) {
        console.error('Failed to load meeting:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetingData();
  }, [id, processTranscript]);

  const displayedActions = showAllActions ? actions : actions.slice(0, 2);
  const hasMoreActions = actions.length > 2;

  const toggleTranscript = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFullTranscript(!showFullTranscript);
  };

  const toggleHighlights = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllHighlights(!showAllHighlights);
  };

  return (
    <>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A84FF" />
            <Text style={styles.loadingText}>Loading meeting details...</Text>
          </View>
        ) : !meeting ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Meeting not found</Text>
          </View>
        ) : (
          <>
            <DetailSection icon="title">
              <View style={styles.inlineContainer}>
                <Text style={styles.inlineLabel}>Title:</Text>
                <Text style={styles.value}>{meeting.title}</Text>
              </View>
            </DetailSection>

            <DetailSection icon="event">
              <View style={styles.inlineContainer}>
                <Text style={styles.inlineLabel}>Date:</Text>
                <Text style={styles.value}>
                  {new Date(meeting.date).toLocaleDateString()}
                </Text>
              </View>
            </DetailSection>

            <DetailSection icon="timer">
              <View style={styles.inlineContainer}>
                <Text style={styles.inlineLabel}>Duration:</Text>
                <Text style={styles.value}>
                  {timeUtils.formatDuration(meeting.duration || 0)}
                </Text>
              </View>
            </DetailSection>

            {meeting.transcript && (
              <DetailSection 
                icon="description" 
                label="Transcript"
              >
                <View style={styles.transcriptContainer}>
                  <View style={styles.textContainer}>
                    <Text 
                      style={styles.transcriptText}
                      numberOfLines={showFullTranscript ? undefined : 4}
                    >
                      {meeting.transcript}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={toggleTranscript}
                  >
                    <View style={styles.showMoreContent}>
                      <Text style={styles.showMoreText}>
                        {showFullTranscript ? 'Show Less' : 'Show More'}
                      </Text>
                      <MaterialIcons 
                        name={showFullTranscript ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                        size={24} 
                        color="#0A84FF" 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </DetailSection>
            )}

            {(() => {
              const highlights = meeting?.highlights;
              if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
                return null;
              }
              
              return (
                <DetailSection icon="star" label="Highlights">
                  <View style={styles.listContainer}>
                    <View style={styles.textContainer}>
                      <Text 
                        style={styles.highlightsText}
                        numberOfLines={showAllHighlights ? undefined : 4}
                      >
                        {highlights.map((highlight: string, index: number) => (
                          `• ${highlight}${index < highlights.length - 1 ? '\n' : ''}`
                        )).join('')}
                      </Text>
                    </View>
                    {highlights.length > 4 && (
                      <TouchableOpacity 
                        style={styles.showMoreButton}
                        onPress={toggleHighlights}
                      >
                        <View style={styles.showMoreContent}>
                          <Text style={styles.showMoreText}>
                            {showAllHighlights ? 'Show Less' : 'Show More'}
                          </Text>
                          <MaterialIcons 
                            name={showAllHighlights ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                            size={24} 
                            color="#0A84FF" 
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </DetailSection>
              );
            })()}

            <DetailSection 
              icon="assignment" 
              label="Action Items"
              count={actions.length}
              rightContent={
                <TouchableOpacity onPress={handleAddAction} style={styles.addButton}>
                  <MaterialIcons name="add" size={24} color="#0A84FF" />
                </TouchableOpacity>
              }
            >
              <View style={styles.actionItemsContainer}>
                {processingTranscript && (
                  <Text style={styles.processingText}>
                    Processing transcript for action items...
                  </Text>
                )}
                {displayedActions.map((action) => {
                  // Split title into heading and content if it contains double newlines
                  let heading = action.title;
                  let content = '';
                  
                  if (action.title.includes('\n\n')) {
                    const parts = action.title.split('\n\n');
                    heading = parts[0];
                    content = parts.slice(1).join('\n\n');
                  }
                  
                  return (
                    <View key={action.id} style={styles.actionItem}>
                      <View style={styles.actionItemLeft}>
                        <TouchableOpacity
                          onPress={() => handleToggleStatus(action)}
                          style={[styles.checkbox, action.status === 'not_reviewed' && styles.notReviewedCheckbox]}
                        >
                          <MaterialIcons
                            name={
                              action.status === 'not_reviewed' ? 'hourglass-empty' :
                              action.status === 'pending' ? 'hourglass-empty' :
                              'check-box-outline-blank'
                            }
                            size={24}
                            color={
                              action.status === 'not_reviewed' ? '#FF9500' :
                              action.status === 'pending' ? '#FF9500' :
                              '#999999'
                            }
                          />
                          {action.status === 'not_reviewed' && (
                            <Text style={styles.startWorkingText}>Start Working</Text>
                          )}
                        </TouchableOpacity>
                        <View style={styles.actionItemContent}>
                          <Text style={styles.actionItemTitle}>
                            {heading}
                          </Text>
                          {content ? (
                            <Text style={styles.actionItemText}>
                              {content}
                            </Text>
                          ) : null}
                          <Text style={styles.actionItemDueDate}>
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                          </Text>
                          {action.status === 'not_reviewed' && (
                            <Text style={styles.pendingText}>
                              Not Reviewed
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleEditAction(action)}
                        style={styles.editButton}
                        disabled={action.status === 'completed'}
                      >
                        <MaterialIcons 
                          name="edit" 
                          size={20} 
                          color={action.status === 'completed' ? '#666666' : '#999999'} 
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {hasMoreActions && !showAllActions && (
                  <TouchableOpacity
                    onPress={() => setShowAllActions(true)}
                    style={styles.showMoreButton}
                  >
                    <View style={styles.showMoreContent}>
                      <Text style={styles.showMoreText}>
                        Show More (+{actions.length - 2})
                      </Text>
                      <MaterialIcons 
                        name="keyboard-arrow-down"
                        size={24} 
                        color="#0A84FF" 
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {hasMoreActions && showAllActions && (
                  <TouchableOpacity
                    onPress={() => setShowAllActions(false)}
                    style={styles.showMoreButton}
                  >
                    <View style={styles.showMoreContent}>
                      <Text style={styles.showMoreText}>Show Less</Text>
                      <MaterialIcons 
                        name="keyboard-arrow-up"
                        size={24} 
                        color="#0A84FF" 
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </DetailSection>
          </>
        )}
      </ScrollView>

      <ActionItemModal
        visible={actionModalVisible}
        onClose={() => {
          setActionModalVisible(false);
          setSelectedAction(undefined);
        }}
        onSave={handleSaveAction}
        onDelete={handleDeleteAction}
        onMarkAsReviewed={(action) => handleMarkAsReviewed(action.id)}
        initialAction={selectedAction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  actionItemsContainer: {
    flex: 1,
    width: '100%',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3E',
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  notReviewedCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  startWorkingText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionItemTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  actionItemText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
    marginBottom: 4,
  },
  actionItemDueDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#32D74B',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  showMoreButton: {
    paddingVertical: 8,
    marginTop: 8,
  },
  showMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMoreText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  addButton: {
    padding: 8,
  },
  transcriptContainer: {
    width: '100%',
  },
  textContainer: {
    width: '100%',
  },
  transcriptText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  highlightsText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  processingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  high: {
    color: '#FF0000',
  },
  medium: {
    color: '#FFFF00',
  },
  low: {
    color: '#00FF00',
  },
  pending: {
    color: '#999999',
  },
  completed: {
    color: '#32D74B',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inlineLabel: {
    fontSize: 16,
    color: '#999999',
    marginRight: 8,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  pendingText: {
    color: '#FF9500',
    fontWeight: '500',
  },
  actionItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  actionItemDateCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
});
