import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  RefreshControl, 
  SafeAreaView, 
  ActivityIndicator, 
  Pressable, 
  TouchableOpacity, 
  StyleSheet,
  Platform 
} from 'react-native';
import { meetingsApi, actionsApi, ArchivedMeeting, Action } from '../services/api';
import dateUtils from '../utils/dateUtils';
import timeUtils from '../utils/timeUtils';
import { MaterialIcons } from '@expo/vector-icons';
import commonStyles from '../styles/common';
import theme from '../styles/theme';
import ActionDetailsModal from '../components/ActionDetailsModal';

type ArchiveTab = 'meetings' | 'tasks';

export default function ArchivedScreen() {
  const [archivedMeetings, setArchivedMeetings] = useState<ArchivedMeeting[]>([]);
  const [archivedActions, setArchivedActions] = useState<Action[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('meetings');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const loadArchived = async () => {
    try {
      setLoading(true);
      const [meetingsData, actionsData] = await Promise.all([
        meetingsApi.getArchived(),
        actionsApi.getAll()
      ]);
      
      console.log('Archived Meetings:', meetingsData);
      console.log('All Actions:', actionsData);
      
      const filteredActions = actionsData.filter(action => action.archived === true);
      console.log('Filtered Archived Actions:', filteredActions);
      
      setArchivedMeetings(meetingsData);
      setArchivedActions(filteredActions);
    } catch (error) {
      console.error('Failed to load archived items:', error);
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

  const handleMoveToPending = async (actionId: string) => {
    try {
      await actionsApi.update(actionId, {
        status: 'pending',
        notes: 'Moved back',
        archived: false
      });
      await loadArchived();
    } catch (error) {
      console.error('Failed to move task to pending:', error);
    }
  };

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

  const renderActionItem = ({ item }: { item: Action }) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={() => setSelectedAction(item)}
    >
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>{item.title}</Text>
        </View>
        <View style={styles.actionDetails}>
          <Text style={styles.actionDate}>
            Due: {dateUtils.formatDate(new Date(item.dueDate))}
          </Text>
        </View>
        {item.notes && (
          <Text style={styles.actionNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'meetings' && styles.activeTabButton]}
            onPress={() => setActiveTab('meetings')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'meetings' && styles.activeTabButtonText]}>
              Archived Meetings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.activeTabButton]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'tasks' && styles.activeTabButtonText]}>
              Archived Tasks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === 'meetings' ? archivedMeetings : archivedActions}
        renderItem={activeTab === 'meetings' ? renderMeetingItem : renderActionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={commonStyles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No archived {activeTab === 'meetings' ? 'meetings' : 'tasks'} found
            </Text>
          </View>
        }
      />

      {selectedAction && (
        <ActionDetailsModal
          visible={true}
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onMoveToPending={handleMoveToPending}
          onArchive={() => Promise.resolve()} // No-op since already archived
          onSave={() => Promise.resolve()} // No-op since archived items are read-only
          onComplete={() => Promise.resolve()} // No-op since archived items are read-only
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  activeTabButtonText: {
    color: theme.colors.onPrimary,
  },
  actionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionContent: {
    padding: 16,
  },
  actionHeader: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionDetails: {
    marginBottom: 8,
  },
  actionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
