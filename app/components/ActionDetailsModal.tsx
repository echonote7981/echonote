import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Action } from '../services/api';
import theme from '../styles/theme';

interface ActionDetailsModalProps {
  visible: boolean;
  action: Action;
  onClose: () => void;
  onMoveToPending: (actionId: string) => Promise<void>;
  onArchive: (actionId: string) => Promise<void>;
  onSave?: (actionId: string, notes: string) => Promise<void>;
  onComplete?: (actionId: string) => Promise<void>;
}

export default function ActionDetailsModal({
  visible,
  action,
  onClose,
  onMoveToPending,
  onArchive,
  onSave,
  onComplete,
}: ActionDetailsModalProps) {
  const [notes, setNotes] = useState(action.notes || '');
  const isCompleted = action.status === 'completed';

  const handleArchive = () => {
    Alert.alert(
      'Archive Action',
      'This will be archived. Are you sure you would like to proceed?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await onArchive(action.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to archive action. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMoveToPending = async () => {
    try {
      await onMoveToPending(action.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to move action to pending. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      await onSave?.(action.id, notes);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{action.title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Due Date:</Text>
                  <Text style={styles.value}>
                    {new Date(action.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={[
                    styles.statusText,
                    isCompleted ? styles.completedText : styles.inProgressText
                  ]}>
                    {isCompleted ? 'Task Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>

              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                {isCompleted ? (
                  <Text style={styles.notesText}>
                    {action.notes || 'No notes available'}
                  </Text>
                ) : (
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Add notes here..."
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                {isCompleted ? (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.pendingButton]}
                      onPress={handleMoveToPending}
                    >
                      <Text style={[styles.buttonText, styles.pendingButtonText]}>
                        Move to Pending
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.archiveButton]}
                      onPress={handleArchive}
                    >
                      <Text style={[styles.buttonText, styles.archiveButtonText]}>
                        Archive
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.completeButton]}
                      onPress={async () => {
                        await onComplete?.(action.id);
                        onClose();
                      }}
                    >
                      <Text style={[styles.buttonText, styles.completeButtonText]}>
                        Completed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={onClose}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={async () => {
                        await onSave?.(action.id, notes);
                        onClose();
                      }}
                    >
                      <Text style={[styles.buttonText, styles.saveButtonText]}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  details: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  statusRow: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedText: {
    color: theme.colors.success,
  },
  inProgressText: {
    color: theme.colors.warning,
  },
  notesSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notesLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  notesInput: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
  },
  completeButtonText: {
    color: theme.colors.onPrimary,
  },
  pendingButton: {
    backgroundColor: theme.colors.warning,
  },
  pendingButtonText: {
    color: theme.colors.onPrimary,
  },
  archiveButton: {
    backgroundColor: theme.colors.error,
  },
  archiveButtonText: {
    color: theme.colors.onPrimary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: theme.colors.onPrimary,
  },
});
