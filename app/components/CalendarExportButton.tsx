import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Action } from '../services/api';
import theme from '../styles/theme';
import * as calendarExport from '../utils/calendarExport';

interface CalendarExportButtonProps {
  action: Action;
  style?: any;
}

export default function CalendarExportButton({ action, style }: CalendarExportButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleExportToNative = async () => {
    try {
      const success = await calendarExport.exportToNativeCalendar(action);
      setModalVisible(false);
      
      if (success) {
        Alert.alert('Success', 'Task added to your calendar');
      } else {
        Alert.alert('Error', 'Failed to add task to calendar. Please check calendar permissions.');
      }
    } catch (error) {
      console.error('Calendar export error:', error);
      Alert.alert('Error', 'Something went wrong when exporting to calendar');
    }
  };

  const handleExportToExternal = async (service: 'google' | 'outlook' | 'yahoo') => {
    try {
      const success = await calendarExport.exportToExternalCalendar(action, service);
      setModalVisible(false);
      
      if (!success) {
        Alert.alert('Error', `Could not open ${service} calendar`);
      }
    } catch (error) {
      console.error(`Export to ${service} error:`, error);
      Alert.alert('Error', 'Something went wrong when exporting to calendar');
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, style]} 
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="event" size={22} color={theme.colors.primary} />
        <Text style={styles.buttonText}>Add to Calendar</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export to Calendar</Text>
            <Text style={styles.modalSubtitle}>Choose a calendar service:</Text>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.option} onPress={handleExportToNative}>
                <MaterialIcons name="event" size={24} color={theme.colors.primary} />
                <Text style={styles.optionText}>Device Calendar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.option} onPress={() => handleExportToExternal('google')}>
              <MaterialIcons name="event" size={24} color="#4285F4" />
              <Text style={styles.optionText}>Google Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.option} onPress={() => handleExportToExternal('google')}>
              <MaterialIcons name="mail" size={24} color="#DB4437" />
              <Text style={styles.optionText}>Gmail Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.option} onPress={() => handleExportToExternal('outlook')}>
              <MaterialIcons name="event" size={24} color="#0078D4" />
              <Text style={styles.optionText}>Outlook Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.option} onPress={() => handleExportToExternal('yahoo')}>
              <MaterialIcons name="event" size={24} color="#6001D2" />
              <Text style={styles.optionText}>Yahoo Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});
