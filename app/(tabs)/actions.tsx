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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { actionsApi, Action } from '../services/api';
import theme from '../styles/theme';
import ActionDetailsModal from '../components/ActionDetailsModal';

type ActionStatus = 'pending' | 'completed';

export default function ActionsScreen() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActionStatus>('pending');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const loadActions = async () => {
    try {
      setLoading(true);
      const data = await actionsApi.getAll();
      const filteredData = data.filter(action => 
        action.status === filter && !action.archived
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

  useEffect(() => {
    loadActions();
  }, [filter, sortOrder]);

  const handleActionPress = (action: Action) => {
    setSelectedAction(action);
  };

  const handleSaveNotes = async (actionId: string, notes: string) => {
    try {
      await actionsApi.update(actionId, { notes });
      await loadActions();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes. Please try again.');
    }
  };

  const handleCompleteTask = async (actionId: string) => {
    try {
      await actionsApi.update(actionId, { 
        status: 'completed',
        notes: 'Task Completed'
      });
      await loadActions();
    } catch (error) {
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
      style={[
        styles.actionItem,
        item.status === 'completed' && styles.completedItem
      ]}
      onPress={() => handleActionPress(item)}
    >
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>{item.title}</Text>
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={() => {
              if (item.status === 'pending') {
                handleCompleteTask(item.id);
              } else {
                handleMoveToPending(item.id);
              }
            }}
          >
            <MaterialIcons
              name={item.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={item.status === 'completed' ? theme.colors.success : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.actionDetails}>
          <Text style={styles.actionDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <MaterialIcons
            name={sortOrder === 'desc' ? 'arrow-downward' : 'arrow-upward'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={actions}
        renderItem={renderActionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {filter} actions found</Text>
          </View>
        }
      />

      {selectedAction && (
        <ActionDetailsModal
          visible={true}
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onSave={handleSaveNotes}
          onComplete={handleCompleteTask}
          onMoveToPending={handleMoveToPending}
          onArchive={handleArchive}
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
  sortButton: {
    padding: 8,
    marginLeft: 8,
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
  completedItem: {
    opacity: 0.8,
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
    flex: 1,
  },
  checkButton: {
    padding: 4,
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
