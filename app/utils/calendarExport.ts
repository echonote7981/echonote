import * as Calendar from 'expo-calendar';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { Action } from '../services/api';

/**
 * Utility functions for exporting tasks to external calendar services
 */

// Check if calendar permissions are granted
export const getCalendarPermission = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

// Format a task for calendar export
export const formatTaskForCalendar = (action: Action) => {
  const title = action.title || 'EchoNotes Task';
  const notes = action.notes ? `${action.notes}\n\nExported from EchoNotes` : 'Exported from EchoNotes';
  const startDate = action.dueDate ? new Date(action.dueDate) : new Date();
  
  // Set end date to 1 hour after start date
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);
  
  return {
    title,
    notes,
    startDate,
    endDate,
  };
};

// Export to native calendar (iOS/Android)
export const exportToNativeCalendar = async (action: Action): Promise<boolean> => {
  try {
    const hasPermission = await getCalendarPermission();
    if (!hasPermission) {
      return false;
    }

    // Get default calendar for the device
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.allowsModifications);

    if (!defaultCalendar) {
      return false;
    }

    const { title, notes, startDate, endDate } = formatTaskForCalendar(action);

    // Create calendar event
    await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      notes,
      startDate,
      endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
    });

    return true;
  } catch (error) {
    console.error('Failed to export to calendar:', error);
    return false;
  }
};

// Export to external calendar using URI schemes
export const exportToExternalCalendar = async (action: Action, service: 'google' | 'outlook' | 'yahoo'): Promise<boolean> => {
  try {
    const { title, notes, startDate, endDate } = formatTaskForCalendar(action);
    
    // Format dates for URI
    const start = startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Encode parameters for URI
    const encodedTitle = encodeURIComponent(title);
    const encodedDetails = encodeURIComponent(notes);
    
    let url = '';
    
    switch (service) {
      case 'google':
        // Google Calendar URI format
        url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDetails}&dates=${start}/${end}`;
        break;
        
      case 'outlook':
        // Outlook.com Calendar URI format
        url = `https://outlook.office.com/calendar/action/compose?subject=${encodedTitle}&body=${encodedDetails}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`;
        break;
        
      case 'yahoo':
        // Yahoo Calendar URI format
        url = `https://calendar.yahoo.com/?v=60&title=${encodedTitle}&desc=${encodedDetails}&st=${start}&et=${end}`;
        break;
    }
    
    if (!url) {
      return false;
    }
    
    try {
      // Check if URL can be opened first
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error opening calendar URL:', error);
      return false;
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to export to ${service} calendar:`, error);
    return false;
  }
};
// Added default export for expo-router compatibility
export default function CalendarExportUtils() {
  return null;
}
