import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import calendarStyles from '../styles/calendar';
import theme from '../styles/theme';

// TODO: Replace with actual data from backend
const DUMMY_TASKS = [
  {
    id: '1',
    title: 'Team Meeting',
    time: '10:00 AM',
    date: new Date(),
  },
  {
    id: '2',
    title: 'Project Review',
    time: '2:00 PM',
    date: new Date(),
  },
];

type Action = {
  id: string;
  title: string;
  time: string;
  date: Date;
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startDate, i);
      const isSelected = isSameDay(date, selectedDate);

      return (
        <TouchableOpacity
          key={i}
          style={[calendarStyles.dayButton, isSelected && calendarStyles.selectedDay]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[calendarStyles.dayName, isSelected && calendarStyles.selectedText]}>
            {format(date, 'EEE')}
          </Text>
          <Text style={[calendarStyles.dayNumber, isSelected && calendarStyles.selectedText]}>
            {format(date, 'd')}
          </Text>
        </TouchableOpacity>
      );
    });

    return <View style={calendarStyles.weekContainer}>{weekDays}</View>;
  };

  const filteredTasks = DUMMY_TASKS.filter((task) =>
    isSameDay(task.date, selectedDate)
  );

  const renderTask = ({ item }: { item: Action }) => (
    <View style={calendarStyles.eventCard}>
      <View style={calendarStyles.taskTimeContainer}>
        <Text style={calendarStyles.taskTime}>{item.time}</Text>
        <View style={calendarStyles.timelineDot} />
      </View>
      <View style={calendarStyles.taskContent}>
        <Text style={calendarStyles.taskTitle}>{item.title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={calendarStyles.container}>
        {renderWeekView()}
        <View style={calendarStyles.calendarContainer}>
          <View style={calendarStyles.tasksHeader}>
            <Text style={calendarStyles.dateText}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </Text>
            <TouchableOpacity style={calendarStyles.addButton}>
              <MaterialIcons name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={calendarStyles.eventsList}
            ListEmptyComponent={() => (
              <Text style={calendarStyles.emptyText}>No tasks for this day</Text>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
