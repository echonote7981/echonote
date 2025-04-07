import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Action } from '../services/api';
import theme from '../styles/theme';
import actionStyles from '../styles/actions';
import globalStyles from '../styles/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarExportButton from './CalendarExportButton';
import { useTranslation } from 'react-i18next';

interface ActionDetailsModalProps {
  visible: boolean;
  action: Action;
  onClose: () => void;
  onSave?: (actionId: string, updates: { title: string; notes: string }) => Promise<void>;
  onComplete?: (actionId: string) => Promise<void>;
  onMarkAsReviewed?: (actionId: string) => Promise<void>;
  onReopen?: (actionId: string) => Promise<void>; 
  readOnly?: boolean; 
}

export default function ActionDetailsModal({
  visible,
  action,
  onClose,
  onSave,
  onComplete,
  onMarkAsReviewed,
  onReopen,
  readOnly = false, 
}: ActionDetailsModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(action.title || '');
  const [notes, setNotes] = useState(action.notes || '');
  const [dueDate, setDueDate] = useState<Date>(action.dueDate ? new Date(action.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const isCompleted = action.status === 'completed';
  const isNotReviewed = action.status === 'not_reviewed';
  const isPending = action.status === 'pending';
  
  let heading = title;
  let content = '';
  
  if (title.includes('\n\n')) {
    const parts = title.split('\n\n');
    heading = parts[0];
    content = parts.slice(1).join('\n\n');
  }

  const handleKeyboardShow = (event: KeyboardEvent) => {
    if (readOnly) return;
    
    setTimeout(() => {
      notesInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({
          y: pageY - event.endCoordinates.height,
          animated: true,
        });
      });
    }, 100);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      handleKeyboardShow
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSave = async () => {
    try {
      console.log('Modal handleSave called with:', {
        actionId: action.id,
        currentStatus: action.status,
        updates: { title, notes }
      });
      await onSave?.(action.id, { title, notes });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleComplete = async () => {
    try {
      await onComplete?.(action.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleReopen = async () => {
    try {
      await onReopen?.(action.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to reopen task. Please try again.');
    }
  };

  const handleMarkAsReviewed = async () => {
    try {
      await onMarkAsReviewed?.(action.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[globalStyles.container, { flex: 1 }]}>
    
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={actionStyles.modalContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[actionStyles.modalOverlay, { flex: 1 }]}>
            <View style={[actionStyles.modalContent, { flex: 1 }]}>
              <View style={actionStyles.modalHeader}>
                <Text style={actionStyles.modalHeaderTitle}>
                  {isNotReviewed ? 'New Action Item' : 'Edit Action Item'}
                </Text>
                <TouchableOpacity onPress={onClose} style={actionStyles.modalCloseButton}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                <View style={actionStyles.modalFormContent}>
                  {/* Title Section */}
                  <View style={actionStyles.titleSection}>
                    <View style={actionStyles.sectionHeader}>
                      <Text style={actionStyles.sectionLabel}>Title</Text>
                      <View style={actionStyles.statusContainer}>
                        <MaterialIcons
                          name={isNotReviewed ? 'radio-button-unchecked' : 
                                isPending ? 'hourglass-empty' : 'check-circle'} 
                          size={18} 
                          color={isNotReviewed ? '#999999' : 
                                 isPending ? '#FF9500' : '#32D74B'} 
                        />
                        <Text style={[actionStyles.statusText, 
                          isNotReviewed && actionStyles.notReviewedText,
                          isPending && actionStyles.pendingText,
                          isCompleted && actionStyles.completedText
                        ]}>
                          {isNotReviewed ? 'Not Started' : 
                           isPending ? 'In Progress' : 'Completed'}
                        </Text>
                      </View>
                    </View>
                    
                    {readOnly ? (
                      <View style={[actionStyles.titleInput, { padding: 12 }]}>
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold' }}>
                          {heading}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={actionStyles.titleInput}
                        value={heading}
                        onChangeText={(text) => {
                          if (content) {
                            setTitle(`${text}\n\n${content}`);
                          } else {
                            setTitle(text);
                          }
                        }}
                        placeholder="Task title"
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                      />
                    )}
                    
                    {/* Content Section (if split from title) */}
                    {content && (
                      readOnly ? (
                        <View style={[actionStyles.detailsInput, { padding: 12 }]}>
                          <Text style={{ color: theme.colors.textPrimary }}>
                            {content}
                          </Text>
                        </View>
                      ) : (
                        <TextInput
                          style={actionStyles.detailsInput}
                          value={content}
                          onChangeText={(text) => {
                            setTitle(`${heading}\n\n${text}`);
                          }}
                          placeholder="Task details"
                          placeholderTextColor={theme.colors.textSecondary}
                          multiline
                        />
                      )
                    )}
                  </View>
                  
                  {/* Priority Section - Moved to top as requested */}
                  <View style={actionStyles.prioritySection}>
                    <Text style={actionStyles.sectionLabel}>Priority</Text>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <View style={[actionStyles.priorityBadge]}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontWeight: '500',
                          fontSize: 14
                        }}>
                          {action.priority || 'Medium'}
                        </Text>
                      </View>
                      
                      {/* Due date section */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        <MaterialIcons name="calendar-today" size={16} color="#999" style={{marginRight: 5}} />
                        <Text style={{
                          color: theme.colors.textSecondary,
                          fontSize: 14
                        }}>
                          {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'No due date'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Action Item Details Section */}
                  <View style={actionStyles.detailsSection}>
                    <Text style={actionStyles.sectionLabel}>Action Item Details</Text>
                    {readOnly ? (
                      <View style={[actionStyles.detailsInput, { padding: 12 }]}>
                        <Text style={{ color: theme.colors.textPrimary }}>
                          {action.details || 'No details available'}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={actionStyles.detailsInput}
                        value={action.details}
                        onChangeText={() => {}}
                        multiline
                        editable={false}
                        placeholder="View details here..."
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    )}
                  </View>
                  
                  {/* Notes Section */}
                  <View style={actionStyles.notesSection}>
                    <Text style={actionStyles.sectionLabel}>Notes</Text>
                    {readOnly ? (
                      <View style={[actionStyles.notesInput, { padding: 12 }]}>
                        <Text style={{ color: theme.colors.textPrimary }}>
                          {notes.trim() ? notes : 'No notes available'}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        ref={notesInputRef}
                        style={actionStyles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        placeholder="Add notes here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="sentences"
                        onFocus={() => {
                          notesInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                            scrollViewRef.current?.scrollTo({
                              y: pageY,
                              animated: true,
                            });
                          });
                        }}
                      />
                    )}
                  </View>

                  {/* Calendar Export Button removed as requested */}
                  
                  <View style={actionStyles.modalButtonContainer}>
                    <View style={actionStyles.modalBottomButtons}>
                      {/* For read-only mode, just show a close button */}
                      {readOnly ? (
                        <TouchableOpacity
                          style={[actionStyles.modalButton, actionStyles.cancelButton]}
                          onPress={onClose}
                        >
                          <Text style={actionStyles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                      ) : (
                        /* Standard buttons for editable mode */
                        <>
                          {isNotReviewed && (
                            <TouchableOpacity
                              style={[actionStyles.modalButton, actionStyles.notStartedButton]}
                              onPress={handleMarkAsReviewed}
                            >
                              <Text style={actionStyles.modalButtonText}>Not Started</Text>
                            </TouchableOpacity>
                          )}
                          
                          {/* Show either Complete Task or Reopen button based on status */}
                          {isCompleted ? (
                            <TouchableOpacity
                              style={[actionStyles.modalButton, actionStyles.completeButton]}
                              onPress={handleReopen}
                            >
                              <Text style={actionStyles.modalButtonText}>Reopen</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={[actionStyles.modalButton, actionStyles.completeButton]}
                              onPress={handleComplete}
                            >
                              <Text style={actionStyles.modalButtonText}>Complete Task</Text>
                            </TouchableOpacity>
                          )}
                          
                          {/* Only show Cancel and Save buttons for non-completed tasks */}
                          {!isCompleted && (
                            <>
                              <TouchableOpacity
                                style={[actionStyles.modalButton, actionStyles.cancelButton]}
                                onPress={onClose}
                              >
                                <Text style={actionStyles.modalButtonText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[actionStyles.modalButton, actionStyles.saveButton]}
                                onPress={handleSave}
                              >
                                <Text style={actionStyles.modalButtonText}>Save</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView> 
    </Modal>
    
  );
}
