import React, { useEffect, useState, useRef } from 'react';
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
  Modal,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi, Action, ActionStatus } from '../services/api';
import theme from '../styles/theme';
import globalStyles from '../styles/globalStyles';
import ActionDetailsModal from '../components/ActionDetailsModal';
import ActionItemModal from '../components/ActionItemModal';
import { useRouter } from 'expo-router';

export default function ActionsScreen() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActionStatus>('pending');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // For tracking action item interaction
  const pressStartTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

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

  // Handler to reopen a completed/archived task
  const handleReopenTask = async (actionId: string) => {
    try {
      console.log('🔄 Reopening task:', actionId);
      
      // Update the action to pending status and remove archived flag
      const updatedAction = await actionsApi.update(actionId, {
        status: 'pending',
        archived: false,
        completedAt: undefined, // Clear the completion date
        hasBeenOpened: true // Keep the opened flag
      });
      
      console.log('✅ Task reopened successfully:', updatedAction.title);
      
      // Show confirmation to user
      Alert.alert(
        'Task Reopened', 
        'Task has been moved back to Pending.',
        [{ text: 'OK' }]
      );
      
      // Reload actions to update the UI
      await loadActions();
    } catch (error) {
      console.error('❌ Failed to reopen task:', error);
      Alert.alert('Error', 'Failed to reopen task. Please try again.');
    }
  };

  const handleArchive = async () => {
    if (!selectedAction) return;
    try {
      console.log('💾 Archiving action:', selectedAction.id, selectedAction.title);
      
      // Create a complete update payload with all required fields
      const archivePayload: Partial<Action> = {
        archived: true,
        status: 'completed' as ActionStatus, 
        completedAt: new Date().toISOString(),
        hasBeenOpened: true
      };
      
      console.log('📝 Archive payload:', JSON.stringify(archivePayload));
      
      // First make sure action is marked as completed
      const updatedAction = await actionsApi.update(selectedAction.id, archivePayload);
      
      // Verify the action was updated properly
      console.log('✅ Action archived successfully with data:', JSON.stringify(updatedAction));
      
      // Verify the action is actually marked as archived
      if (updatedAction.archived !== true) {
        console.warn('⚠️ Warning: Action may not have been marked as archived properly');
        
        // Try a second update to force the archived flag if it didn't work
        try {
          console.log('🔄 Retrying archive operation with direct API call...');
          await actionsApi.update(selectedAction.id, {
            archived: true,
            completedAt: new Date().toISOString()
          });
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
        }
      }
      
      // Force a data refresh by clearing the action list and reloading
      setActions([]);
      setShowActionMenu(false);
      setSelectedAction(null);
      
      // Show confirmation to user
      Alert.alert(
        'Success', 
        'Task archived successfully. You can view it in the Archives tab.',
        [
          { 
            text: 'View Archives', 
            onPress: () => {
              // Navigate to archives tab
              try {
                router.push('/(tabs)/archived');
              } catch (navError) {
                console.error('❌ Navigation error:', navError);
              }
            } 
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      
      // Give the API a moment to process before refreshing
      setTimeout(async () => {
        // Reload both actions and archived actions to ensure UI is in sync
        await loadActions();
        try {
          const archived = await actionsApi.getArchived();
          console.log(`📄 Found ${archived.length} archived items after archiving`);
        } catch (err) {
          console.error('❌ Error checking archived actions', err);
        }
      }, 500);
    } catch (error) {
      console.error('❌ Failed to archive task:', error);
      Alert.alert('Error', 'Failed to archive task. Please try again.');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedAction) return;
    try {
      await actionsApi.delete(selectedAction.id);
      setShowDeleteConfirm(false);
      setSelectedAction(null);
      await loadActions();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };
  
  // Handle regular press to open action item
  const handleActionItemPress = (action: Action) => {
    handleActionPress(action);
  };
  
  // Handle long press to show action menu
  const handleLongPress = (action: Action) => {
    setSelectedAction(action);
    setShowActionMenu(true);
  };

  const renderActionItem = ({ item }: { item: Action }) => {
    // Split title into heading and content if it contains double newlines
    // This matches the display format in the Meeting Details page
    let heading = item.title;
    let content = '';
    
    if (item.title && item.title.includes('\n\n')) {
      const parts = item.title.split('\n\n');
      heading = parts[0];
      content = parts.slice(1).join('\n\n');
    }
    
    return (
      <TouchableOpacity
        style={globalStyles.actionItem}
        onPress={() => handleActionItemPress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={2000}
        activeOpacity={0.7}
      >
        <View style={globalStyles.actionContent}>
          <View style={globalStyles.actionHeader}>
            <View style={globalStyles.statusContainer}>
              <Text style={[
                globalStyles.statusText,
                (item.status === 'in_progress' || (item.status === 'pending' && item.hasBeenOpened)) && globalStyles.inProgressText,
                item.status === 'completed' && globalStyles.completedText,
              ]}>
                {item.status === 'pending' && !item.hasBeenOpened ? 'Pending' : 
                 item.status === 'in_progress' || (item.status === 'pending' && item.hasBeenOpened) ? 'In Progress' : 
                 item.status === 'completed' ? 'Completed' : 'Not Started'}
              </Text>
              
              {filter === 'pending' && (
                <View style={[
                  globalStyles.priorityFlag,
                  item.priority === 'High' && globalStyles.highPriorityFlag,
                  item.priority === 'Medium' && globalStyles.mediumPriorityFlag,
                  item.priority === 'Low' && globalStyles.lowPriorityFlag,
                ]}>
                  <Text style={globalStyles.priorityText}>{item.priority}</Text>
                </View>
              )}
            </View>
            <Text style={globalStyles.actionDueDate}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <Text style={globalStyles.actionTitle}>{heading}</Text>
          {content ? (
            <Text style={globalStyles.actionText}>
              {content}
            </Text>
          ) : null}
          {item.notes && (
            <Text style={globalStyles.actionNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    loadActions();
  }, [filter, sortOrder]);

  const filteredActions = searchText.trim() === '' 
    ? actions 
    : actions.filter(action => 
        action.title.toLowerCase().includes(searchText.toLowerCase()) || 
        (action.notes && action.notes.toLowerCase().includes(searchText.toLowerCase()))
      );

  // Render the action menu modal (Archive/Delete options)
  const renderActionMenu = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showActionMenu}
      onRequestClose={() => setShowActionMenu(false)}
    >
      <Pressable
        style={globalStyles.modalOverlay}
        onPress={() => setShowActionMenu(false)}
      >
        <View style={globalStyles.actionMenuContainer}>
          <View style={globalStyles.actionMenu}>
            <Pressable
              style={globalStyles.actionButton}
              onPress={handleArchive}
            >
              <MaterialIcons name="archive" size={24} color="#007AFF" />
              <Text style={globalStyles.actionButtonText}>Archive</Text>
            </Pressable>
            <Pressable
              style={[globalStyles.actionButton, { marginLeft: 10 }]}
              onPress={() => {
                setShowActionMenu(false);
                setShowDeleteConfirm(true);
              }}
            >
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
              <Text style={[globalStyles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  // Render delete confirmation modal
  const renderDeleteConfirm = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteConfirm}
      onRequestClose={() => setShowDeleteConfirm(false)}
    >
      <Pressable
        style={globalStyles.modalOverlay}
        onPress={() => setShowDeleteConfirm(false)}
      >
        <View style={globalStyles.confirmDialog}>
          <Text style={globalStyles.confirmTitle}>Delete Task</Text>
          <Text style={globalStyles.confirmMessage}>
            Are you sure you want to delete this task? This action cannot be undone.
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
              onPress={handleDelete}
            >
              <Text style={[globalStyles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={globalStyles.filterButtons}>
          <TouchableOpacity
            style={[globalStyles.filterButton, filter === 'pending' && globalStyles.activeFilterButton]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[globalStyles.filterButtonText, filter === 'pending' && globalStyles.activeFilterButtonText]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.filterButton, filter === 'completed' && globalStyles.activeFilterButton]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[globalStyles.filterButtonText, filter === 'completed' && globalStyles.activeFilterButtonText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.headerActions}>
          <TouchableOpacity
            style={globalStyles.iconButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialIcons
              name="search"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.iconButton}
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
        <View style={globalStyles.searchContainer}>
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')} style={globalStyles.clearButton}>
              <MaterialIcons name="clear" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredActions}
        renderItem={renderActionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Text style={globalStyles.emptyText}>
              {searchText.trim() !== '' ? 'No matching tasks found' : `No ${filter} actions found`}
            </Text>
          </View>
        }
      />

      {selectedAction && !showActionMenu && !showDeleteConfirm && (
        filter === 'pending' ? (
          <ActionItemModal
            visible={true}
            initialAction={selectedAction}
            onClose={handleModalClose}
            onSave={(updatedAction) => {
              // Map the data structure from ActionItemModal to what handleSaveNotes expects
              handleSaveNotes(selectedAction.id, {
                title: updatedAction.title || '',
                notes: updatedAction.notes || ''
              });
            }}
            onDelete={selectedAction ? (action) => {
              setShowDeleteConfirm(true);
            } : undefined}
            onCompleteTask={handleCompleteTask}
            isPendingFolder={true}
          />
        ) : (
          <ActionDetailsModal
            visible={true}
            action={selectedAction}
            onClose={handleModalClose}
            onSave={handleSaveNotes}
            onComplete={handleCompleteTask}
            onReopen={handleReopenTask}
          />
        )
      )}
      
      {/* Render modals */}
      {renderActionMenu()}
      {renderDeleteConfirm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityFlag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highPriorityFlag: {
    backgroundColor: '#FF453A',
  },
  mediumPriorityFlag: {
    backgroundColor: '#FFD60A',
  },
  lowPriorityFlag: {
    backgroundColor: '#32D74B',
  },
  priorityText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuContainer: {
    width: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 20,
  },
  actionMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
    width: 100,
  },
  actionButtonText: {
    color: '#007AFF',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDialog: {
    width: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 20,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmMessage: {
    color: '#AAAAAA',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3A3A3C',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    fontWeight: '600',
    fontSize: 16,
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
