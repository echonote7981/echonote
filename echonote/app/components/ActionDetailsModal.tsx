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
}

export default function ActionDetailsModal({
  visible,
  action,
  onClose,
  onSave,
  onComplete,
}: ActionDetailsModalProps) {
  const [title, setTitle] = useState(action.title || '');
  const [notes, setNotes] = useState(action.notes || '');
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const isCompleted = action.status === 'completed';

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
                <TextInput
                  style={actionStyles.modalTitle}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter title"
                  placeholderTextColor={theme.colors.textSecondary}
                />
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
                  <View style={actionStyles.notesSection}>
                    <Text style={actionStyles.notesLabel}>Notes:</Text>
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
                      <TouchableOpacity
                        style={[actionStyles.modalButton, actionStyles.completeButton]}
                        onPress={handleComplete}
                      >
                        <Text style={actionStyles.modalButtonText}>Complete Task</Text>
                      </TouchableOpacity>
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
