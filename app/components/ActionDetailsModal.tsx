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

interface ActionDetailsModalProps {
  visible: boolean;
  action: Action;
  onClose: () => void;
  onSave?: (actionId: string, updates: { title: string; notes: string }) => Promise<void>;
  onComplete?: (actionId: string) => Promise<void>;
  onMarkAsReviewed?: (actionId: string) => Promise<void>;
  onReopen?: (actionId: string) => Promise<void>; // Add reopen handler prop
}

export default function ActionDetailsModal({
  visible,
  action,
  onClose,
  onSave,
  onComplete,
  onMarkAsReviewed,
  onReopen,
}: ActionDetailsModalProps) {
  const [title, setTitle] = useState(action.title || '');
  const [notes, setNotes] = useState(action.notes || '');
  const [dueDate, setDueDate] = useState<Date>(action.dueDate ? new Date(action.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const isCompleted = action.status === 'completed';
  const isNotReviewed = action.status === 'not_reviewed';
  const isPending = action.status === 'pending';
  
  // Parse the title to extract heading and content if needed
  let heading = title;
  let content = '';
  
  if (title.includes('\n\n')) {
    const parts = title.split('\n\n');
    heading = parts[0];
    content = parts.slice(1).join('\n\n');
  }

  const handleKeyboardShow = (event: KeyboardEvent) => {
    // Delay scrolling to ensure the keyboard is fully shown
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

  // Add function to handle reopening a task
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={actionStyles.modalContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={actionStyles.modalOverlay}>
            <View style={actionStyles.modalContent}>
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
                style={actionStyles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
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
                    
                    <TextInput
                      style={actionStyles.titleInput}
                      value={heading}
                      onChangeText={setTitle}
                      placeholder="Enter title"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    
                    {/* Details Section - Editable textarea for content */}
                    {content ? (
                      <View style={actionStyles.detailsSection}>
                        <Text style={actionStyles.sectionLabel}>Details</Text>
                        <TextInput
                          style={actionStyles.detailsInput}
                          value={content}
                          onChangeText={(newContent) => {
                            // Update title while preserving the heading
                            const updatedTitle = heading + '\n\n' + newContent;
                            setTitle(updatedTitle);
                          }}
                          multiline
                          placeholder="View and edit details here..."
                          placeholderTextColor={theme.colors.textSecondary}
                        />
                      </View>
                    ) : null}
                  </View>
                  
                  {/* Priority Section */}
                  <View style={actionStyles.prioritySection}>
                    <Text style={actionStyles.sectionLabel}>Priority</Text>
                    <View style={actionStyles.priorityBadge}>
                      <Text style={actionStyles.priorityBadgeText}>
                        {action.priority || 'Medium'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Due Date Section */}
                  <View style={actionStyles.dueDateSection}>
                    <Text style={actionStyles.sectionLabel}>Due Date</Text>
                    <View style={actionStyles.dateDisplay}>
                      <Text style={actionStyles.dateText}>
                        {dueDate.toLocaleDateString()}
                      </Text>
                      <MaterialIcons name="calendar-today" size={18} color="#AAAAAA" />
                    </View>
                  </View>
                  
                  {/* Notes Section */}
                  <View style={actionStyles.notesSection}>
                    <Text style={actionStyles.sectionLabel}>Notes</Text>
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
                        // Scroll to input when focused
                        notesInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                          scrollViewRef.current?.scrollTo({
                            y: pageY,
                            animated: true,
                          });
                        });
                      }}
                    />
                  </View>
                  


                  <View style={actionStyles.modalButtonContainer}>
                    <View style={actionStyles.modalBottomButtons}>
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
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
