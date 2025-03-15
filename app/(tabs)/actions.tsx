import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi, Action } from '../services/api';
import theme from '../styles/theme';
import ActionDetailsModal from '../components/ActionDetailsModal';

type ActionStatus = 'pending' | 'in_progress' | 'completed';

export default function ActionsScreen() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActionStatus>('pending');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);

  const loadActions = async () => {
    try {
      setLoading(true);
      const data = await actionsApi.getAll();
      const filteredData = data.filter(action => 
        // Only show reviewed actions (not 'not_reviewed') that match the current filter
        action.status !== 'not_reviewed' && 
        (action.status === filter || (filter === 'pending' && action.status === 'in_progress')) && 
        !action.archived
      );
      
      const sortedData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setActions(sortedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load actions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActions();
    setRefreshing(false);
  };

  const handleActionPress = async (action: Action) => {
    try {
      // First verify the action exists
      console.log('Verifying action exists:', action.id);
      const existingAction = await actionsApi.getById(action.id);
      
      if (!existingAction) {
        console.error('Action not found:', action.id);
        Alert.alert('Error', 'Action not found. Please refresh the list.');
        return;
      }

      // Set selected action to open the modal
      setSelectedAction(existingAction);

      // Then update hasBeenOpened if needed
      if (!existingAction.hasBeenOpened) {
        await actionsApi.update(action.id, {
          hasBeenOpened: true
        });
      }
    } catch (error) {
      console.error('Failed to update action:', error);
      Alert.alert('Error', 'Failed to update action status.');
    }
  };

  const handleModalClose = () => {
    setSelectedAction(null);
  };

  const handleSaveNotes = async (actionId: string, updates: { title: string; notes: string }) => {
    try {
      const action = actions.find(a => a.id === actionId);
      if (!action) {
        console.error('Action not found for save:', actionId);
        return;
      }

      console.log('Saving notes:', {
        actionId,
        updates,
        currentAction: action
      });
      
      // Use the new saveNotes method that only updates title and notes
      await actionsApi.saveNotes(actionId, updates);
      await loadActions();
      setSelectedAction(null);
    } catch (error) {
      console.error('Failed to save:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleCompleteTask = async (actionId: string) => {
    try {
      const action = actions.find(a => a.id === actionId);
      if (!action) {
        console.error('Action not found for complete:', actionId);
        return;
      }

      if (action.status === 'completed') {
        console.log('Action already completed:', actionId);
        return;
      }

      console.log('Completing action:', {
        id: actionId,
        currentStatus: action.status,
        updates: {
          status: 'completed'
        }
      });

      await actionsApi.update(actionId, {
        status: 'completed'
      });
      await loadActions();
      setSelectedAction(null);
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleMoveToPending = async (actionId: string) => {
    try {
      await actionsApi.update(actionId, {
        status: 'pending',
        notes: 'Moved back',
        archived: false
      });
      await loadActions();
    } catch (error) {
      Alert.alert('Error', 'Failed to move task to pending. Please try again.');
    }
  };

  const handleArchive = async (actionId: string) => {
    try {
      await actionsApi.update(actionId, {
        archived: true,
        status: 'completed'
      });
      await loadActions();
    } catch (error) {
      Alert.alert('Error', 'Failed to archive task. Please try again.');
    }
  };

  const renderActionItem = ({ item }: { item: Action }) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={() => handleActionPress(item)}
    >
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Text style={[
            styles.statusText,
            item.status === 'in_progress' && styles.inProgressText,
            item.status === 'completed' && styles.completedText,
          ]}>
            {item.status === 'pending' && !item.hasBeenOpened ? 'Pending' : 
             item.status === 'in_progress' ? 'In Progress' : 
             'Completed'}
          </Text>
          <Text style={styles.actionDueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.actionTitle}>{item.title}</Text>
        {item.notes && (
          <Text style={styles.actionNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadActions();
  }, [filter, sortOrder]);

  const filteredActions = searchText.trim() === '' 
    ? actions 
    : actions.filter(action => 
        action.title.toLowerCase().includes(searchText.toLowerCase()) || 
        (action.notes && action.notes.toLowerCase().includes(searchText.toLowerCase()))
      );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.activeFilterButton]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterButtonText, filter === 'pending' && styles.activeFilterButtonText]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.activeFilterButton]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterButtonText, filter === 'completed' && styles.activeFilterButtonText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialIcons
              name="search"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            <MaterialIcons
              name={sortOrder === 'desc' ? 'arrow-downward' : 'arrow-upward'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <MaterialIcons name="clear" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredActions}
        renderItem={renderActionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText.trim() !== '' ? 'No matching tasks found' : `No ${filter} actions found`}
            </Text>
          </View>
        }
      />

      {selectedAction && (
        <ActionDetailsModal
          visible={true}
          action={selectedAction}
          onClose={handleModalClose}
          onSave={handleSaveNotes}
          onComplete={handleCompleteTask}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  activeFilterButtonText: {
    color: theme.colors.onPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  actionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  actionDueDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: '500',
  },
  inProgressText: {
    color: theme.colors.warning,
  },
  completedText: {
    color: theme.colors.success,
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
