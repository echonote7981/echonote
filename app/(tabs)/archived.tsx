import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, RefreshControl, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { meetingsApi, actionsApi, ArchivedMeeting, Action } from '../services/api';
import dateUtils from '../utils/dateUtils';
import timeUtils from '../utils/timeUtils';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../styles/theme';
import globalStyles from '../styles/globalStyles';

type ArchiveTab = 'meetings' | 'tasks';

export default function ArchivedScreen() {
  const [archivedMeetings, setArchivedMeetings] = useState<ArchivedMeeting[]>([]);
  const [archivedActions, setArchivedActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('meetings');
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load archived meetings
      const meetings = await meetingsApi.getArchived();
      setArchivedMeetings(meetings);

      // Load archived and completed actions
      const actions = await actionsApi.getArchived();
      setArchivedActions(actions);
    } catch (error) {
      console.error('Error loading archived data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

  // Render an archived meeting with expandable details
  const renderMeetingItem = ({ item }: { item: ArchivedMeeting }) => {
    const isExpanded = expandedMeeting === item.id;

    return (
      <TouchableOpacity 
        onPress={() => toggleExpand(item.id)} 
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
              
              {item.transcript && (
                <View style={globalStyles.detailRow}>
                  <MaterialIcons name="description" size={20} color={theme.colors.textSecondary} />
                  <Text style={globalStyles.detailText}>
                    {item.transcript.length > 100 
                      ? item.transcript.substring(0, 100) + '...' 
                      : item.transcript}
                  </Text>
                </View>
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
        <View style={globalStyles.filterButtons}>
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
      </View>

      {/* Content based on active tab */}
      {activeTab === 'meetings' ? (
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
      )}
    </SafeAreaView>
  );
}
