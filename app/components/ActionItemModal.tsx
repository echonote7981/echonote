import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Linking,
} from 'react-native';
import { Action } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ActionItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (action: Partial<Action>) => void;
  onDelete?: (action: Action) => void;
  onMarkAsReviewed?: (action: Action) => void;
  onCompleteTask?: (actionId: string) => void;
  initialAction?: Action;
  isPendingFolder?: boolean;
}

function ActionItemModal({ visible, onClose, onSave, onDelete, onMarkAsReviewed, onCompleteTask, initialAction, isPendingFolder = false }: ActionItemModalProps) {
  const [title, setTitle] = useState(initialAction?.title || '');
  const [notes, setNotes] = useState(initialAction?.notes || '');
  const [details, setDetails] = useState(initialAction?.details || '');
  const [priority, setPriority] = useState<Action['priority']>(initialAction?.priority || 'Medium');
  const [status, setStatus] = useState<Action['status']>(initialAction?.status || 'pending');
  const [dueDate, setDueDate] = useState(
    initialAction?.dueDate ? new Date(initialAction.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInputText, setDateInputText] = useState(
    initialAction?.dueDate 
      ? new Date(initialAction.dueDate).toLocaleDateString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  );

  // Reset state when modal is closed or when initialAction changes
  useEffect(() => {
    if (visible) {
      setTitle(initialAction?.title || '');
      setNotes(initialAction?.notes || '');
      setDetails(initialAction?.details || '');
      setPriority(initialAction?.priority || 'Medium');
      setStatus(initialAction?.status || 'not_reviewed');
      const newDueDate = initialAction?.dueDate 
        ? new Date(initialAction.dueDate) 
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setDueDate(newDueDate);
      setDateInputText(newDueDate.toLocaleDateString());
    }
  }, [visible, initialAction]);

  const handleClose = () => {
    onClose();
    // Reset state when modal is closed
    setTitle('');
    setNotes('');
    setDetails('');
    setPriority('Medium');
    setStatus('pending');
    const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setDueDate(defaultDueDate);
    setDateInputText(defaultDueDate.toLocaleDateString());
    setShowDatePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(currentDate);
      setDateInputText(currentDate.toLocaleDateString());
    }
  };

  const handleDateInputChange = (text: string) => {
    setDateInputText(text);
    
    // Try to parse the entered date
    const parsedDate = new Date(text);
    if (!isNaN(parsedDate.getTime())) {
      setDueDate(parsedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    onSave({
      ...initialAction,
      title: title.trim(),
      notes: notes.trim(),
      details: details.trim(),
      priority,
      status,
      dueDate: dueDate.toISOString(),
    });
    
    // Modal will only close if it's an existing action (edit mode)
    // For new actions, we'll keep it open and let the parent decide when to close
    if (initialAction && initialAction.id) {
      onClose();
    }
  };

  const handleMarkAsReviewed = () => {
    if (onMarkAsReviewed && initialAction) {
      onMarkAsReviewed(initialAction);
      onClose();
    }
  };

  // Handle sharing action item via email
  const shareViaEmail = async () => {
    try {
      // Format the action item details for the email body
      const formattedDueDate = dueDate.toLocaleDateString();
      
      // Display the proper status based on our business logic
      let statusText = 'Not Started';
      if (status === 'pending' && initialAction?.hasBeenOpened) {
        statusText = 'In Progress';
      } else if (status === 'pending' && !initialAction?.hasBeenOpened) {
        statusText = 'Pending';
      } else if (status === 'in_progress') {
        statusText = 'In Progress';
      } else if (status === 'completed') {
        statusText = 'Completed';
      }
      
      const emailSubject = `Action Item: ${title}`;
      
      // Build email body with all the action item details
      let emailBody = `Action Item: ${title}\n\n`;
      emailBody += `Status: ${statusText}\n`;
      emailBody += `Priority: ${priority}\n`;
      emailBody += `Due Date: ${formattedDueDate}\n\n`;
      
      if (details.trim()) {
        emailBody += `Details:\n${details}\n\n`;
      }
      
      if (notes.trim()) {
        emailBody += `Notes:\n${notes}\n\n`;
      }
      
      emailBody += `\n\nSent from EchoNotes`;
      
      // Encode the email content for the mailto URL
      const encodedSubject = encodeURIComponent(emailSubject);
      const encodedBody = encodeURIComponent(emailBody);
      
      // Create the mailto URL
      const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
      
      // Check if the device can handle the mailto URL
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        // Open the device's email client
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Error',
          'No email client found on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sharing via email:', error);
      Alert.alert(
        'Error',
        'Failed to open email client. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const priorities: Action['priority'][] = ['High', 'Medium', 'Low'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>
                {initialAction ? 'Edit Action Item' : 'New Action Item'}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#999999" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formContent}>
                <View style={styles.formGroup}>
                  <View style={styles.titleHeader}>
                    <Text style={styles.label}>Title</Text>
                    <View style={styles.headerControls}>
                      <TouchableOpacity
                        style={styles.emailLink}
                        onPress={shareViaEmail}
                      >
                        <MaterialIcons
                          name="email"
                          size={18}
                          color="#34B7F1"
                        />
                        <Text style={styles.emailLinkText}>Email</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => {
                          // Toggle between not_reviewed, pending, and completed states
                          if (status === 'not_reviewed') {
                            setStatus('pending');
                          } else if (status === 'pending') {
                            setStatus('completed');
                          } else {
                            setStatus('not_reviewed');
                          }
                        }}
                      >
                        <MaterialIcons
                          name={
                            status === 'not_reviewed' ? 'radio-button-unchecked' :
                            status === 'pending' ? 'hourglass-empty' : 'check-box'
                          }
                          size={20}
                          color={
                            status === 'not_reviewed' ? '#999999' :
                            status === 'pending' ? '#FF9500' : '#0A84FF'
                          }
                        />
                        <Text style={[
                          styles.statusButtonText,
                          status === 'not_reviewed' && styles.statusButtonTextNotReviewed,
                          status === 'pending' && styles.statusButtonTextPending
                        ]}>
                          {status === 'not_reviewed' ? 'Not Started' :
                           status === 'pending' ? 'In Progress' : 'Completed'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, styles.titleInput]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter title"
                    placeholderTextColor="#999"
                    autoFocus
                    multiline
                    numberOfLines={2}
                    returnKeyType="next"
                  />
                </View>

                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonSelected,
                        priority === p && {
                          backgroundColor: p === 'High' ? '#FF453A' : p === 'Medium' ? '#FFD60A' : '#32D74B',
                          borderColor: p === 'High' ? '#FF453A' : p === 'Medium' ? '#FFD60A' : '#32D74B',
                        }
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          priority === p && styles.priorityTextSelected,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Due Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={dateInputText}
                    onChangeText={handleDateInputChange}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#666666"
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={showDatePickerModal}
                  >
                    <MaterialIcons name="calendar-today" size={20} color="#999999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.dateHint}>
                  Enter date (MM/DD/YYYY) or tap calendar to select
                </Text>

                {Platform.OS === 'ios' && showDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <TouchableOpacity 
                        onPress={() => setShowDatePicker(false)}
                        style={styles.datePickerDoneButton}
                      >
                        <Text style={styles.datePickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      textColor="#FFFFFF"
                      style={styles.datePicker}
                    />
                  </View>
                )}

                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    themeVariant="dark"
                  />
                )}

                <Text style={styles.label}>Action Item Details</Text>
                <TextInput
                  style={[styles.input, styles.detailsInput]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Enter detailed description of the action item"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="next"
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes (optional)"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                
                <View style={styles.buttonRow}>
                  {initialAction && isPendingFolder && onCompleteTask && (
                    <TouchableOpacity 
                      style={[styles.button, styles.completeButton]} 
                      onPress={() => {
                        Alert.alert(
                          'Complete Task',
                          'Mark this action item as completed?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Complete',
                              onPress: () => {
                                onCompleteTask(initialAction.id);
                                handleClose();
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <Text style={styles.buttonText}>Complete Task</Text>
                    </TouchableOpacity>
                  )}
                  {initialAction && onDelete && !isPendingFolder && (
                    <TouchableOpacity 
                      style={[styles.button, styles.deleteButton]} 
                      onPress={() => {
                        Alert.alert(
                          'Delete Action Item',
                          'Are you sure you want to delete this action item?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                onDelete(initialAction);
                                handleClose();
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={handleClose}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.saveButton,
                      !title.trim() && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={!title.trim()}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: '90%',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  detailsInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  titleInput: {
    minHeight: 40,
    textAlignVertical: 'top',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
  },
  saveButton: {
    backgroundColor: '#0A84FF',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  emailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  emailLinkText: {
    color: '#34B7F1',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF453A',
  },
  completeButton: {
    backgroundColor: '#30D158',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginRight: 8,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderWidth: 0,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  priorityTextSelected: {
    color: '#000000',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
  },
  datePickerButton: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  dateHint: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 16,
  },
  datePickerContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3E',
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    height: 200,
  },
  buttonSpacer: {
    minWidth: 100,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statusButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#999999',
  },
  statusButtonTextPending: {
    color: '#FF9500',
  },
  statusButtonTextNotReviewed: {
    color: '#999999',
  },
});

export default ActionItemModal;
