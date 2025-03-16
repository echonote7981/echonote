import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import calendarStyles from '../styles/calendar';
import theme from '../styles/theme';
import { actionsApi, Action } from '../services/api';
import ActionDetailsModal from '../components/ActionDetailsModal';
import ActionItemModal from '../components/ActionItemModal';



export default function CalendarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionsByDate, setActionsByDate] = useState<{[key: string]: Action[]}>({});

  // Load all pending actions
  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      setLoading(true);
      // Get all pending actions
      const actionsData = await actionsApi.getAll({ status: 'pending' });
      setActions(actionsData);
      
      // Group actions by due date
      const groupedByDate: {[key: string]: Action[]} = {};
      const marked: {[key: string]: any} = {};
      
      actionsData.forEach(action => {
        if (action.dueDate) {
          const dateKey = action.dueDate.split('T')[0];
          
          // Group actions by date
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }
          groupedByDate[dateKey].push(action);
          
          // Mark dates with actions
          marked[dateKey] = {
            marked: true,
            dotColor: theme.colors.primary,
            selected: dateKey === selectedDate,
            selectedColor: theme.colors.primaryLight,
            // Show count as text
            text: groupedByDate[dateKey].length.toString()
          };
        }
      });
      
      setActionsByDate(groupedByDate);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to load actions for calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection in calendar
  const handleDateSelect = (date: DateData) => {
    const dateString = date.dateString;
    setSelectedDate(dateString);
    
    // Update marked dates to highlight the selected date
    const updatedMarkedDates = { ...markedDates };
    
    // Reset previously selected date
    Object.keys(updatedMarkedDates).forEach(key => {
      if (updatedMarkedDates[key].selected) {
        updatedMarkedDates[key] = {
          ...updatedMarkedDates[key],
          selected: false
        };
      }
    });
    
    // Mark new selected date
    if (updatedMarkedDates[dateString]) {
      updatedMarkedDates[dateString] = {
        ...updatedMarkedDates[dateString],
        selected: true,
        selectedColor: theme.colors.primaryLight
      };
    } else {
      updatedMarkedDates[dateString] = {
        selected: true,
        selectedColor: theme.colors.primaryLight
      };
    }
    
    setMarkedDates(updatedMarkedDates);
  };

  // Navigate to the action details in the Actions tab
  const handleActionPress = (action: Action) => {
    setSelectedAction(action);
    setShowDetailsModal(true);
  };

  // Close the action details modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedAction(null);
  };

  // Navigate back to pending actions
  const handleGoToPendingActions = () => {
    setShowDetailsModal(false);
    setSelectedAction(null);
    // Navigate to the actions tab
    router.push('/(tabs)/actions');
  };

  // Render an action item
  const renderActionItem = ({ item }: { item: Action }) => (
    <TouchableOpacity 
      style={calendarStyles.actionCard}
      onPress={() => handleActionPress(item)}
    >
      <View style={calendarStyles.actionPriority} />
      <View style={calendarStyles.actionContent}>
        <Text style={calendarStyles.actionTitle}>{item.title}</Text>
        {item.notes && (
          <Text style={calendarStyles.actionNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={calendarStyles.safeArea}>
      <View style={calendarStyles.container}>
        {loading ? (
          <View style={calendarStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={calendarStyles.loadingText}>Loading calendar...</Text>
          </View>
        ) : (
          <>
            {/* Calendar View */}
            <Calendar
              style={calendarStyles.calendar}
              theme={{
                backgroundColor: theme.colors.surface,
                calendarBackground: theme.colors.surface,
                textSectionTitleColor: theme.colors.textPrimary,
                textSectionTitleDisabledColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.onPrimary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.textPrimary,
                textDisabledColor: theme.colors.textSecondary,
                dotColor: theme.colors.primary,
                selectedDotColor: theme.colors.onPrimary,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.textPrimary,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              markingType="custom"
              enableSwipeMonths
            />

            {/* Actions List */}
            <View style={calendarStyles.actionsContainer}>
              <Text style={calendarStyles.dateHeader}>
                {selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'No date selected'}
              </Text>

              {actionsByDate[selectedDate] && actionsByDate[selectedDate].length > 0 ? (
                <FlatList
                  data={actionsByDate[selectedDate]}
                  renderItem={renderActionItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={calendarStyles.actionsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={calendarStyles.emptyText}>No tasks for this day</Text>
              )}
            </View>
          </>
        )}

        {/* Action Details Modal */}
        {selectedAction && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showDetailsModal}
            onRequestClose={handleCloseModal}
          >
            <View style={calendarStyles.modalContainer}>
              <View style={calendarStyles.modalContent}>
                <ActionItemModal
                  visible={true}
                  initialAction={selectedAction}
                  onClose={handleCloseModal}
                  onSave={(updatedAction) => {
                    // Reload actions after save to reflect any changes
                    handleCloseModal();
                    loadActions();
                  }}
                  onDelete={(action) => {
                    // Handle deletion if needed
                    handleCloseModal();
                    loadActions();
                  }}
                />
                <TouchableOpacity 
                  style={calendarStyles.backToCalendarLink}
                  onPress={handleGoToPendingActions}
                >
                  <Text style={calendarStyles.backToCalendarText}>Go to Pending Actions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}
