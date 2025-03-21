import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the correct localhost for the device
const getLocalhost = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android emulator localhost
  }
  if (Constants.isDevice) {
    // Use your computer's local IP address when testing on a physical device
    return '192.168.1.240'; // Your local IP address
  }
  return Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
};

const localhost = getLocalhost();

const BASE_URL = __DEV__
  ? `http://${localhost}:3000/api`
  : 'https://your-production-url.com/api';

console.log('API URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 second timeout for file uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    throw error;
  }
);

// Get meeting audio
getAudio: async (id: string): Promise<Blob> => {
  try {
    const response = await api.get(`/meetings/${id}/audio`, {
      responseType: 'blob' // Important for binary data
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get audio for meeting ${id}:`, error);
    throw error;
  }
}

// In your meetingsApi.create method
create: async (data: { title: string; audioUri: string; duration: number }) => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('duration', data.duration.toString());

    // Append the audio file
    const uriParts = data.audioUri.split('.');
    const fileType = uriParts[uriParts.length - 1].toLowerCase();
    const mimeType = `audio/${fileType === 'm4a' ? 'mp4' : fileType}`;

    formData.append('audio', {
      uri: data.audioUri,
      name: `recording.${fileType}`,
      type: mimeType,
    } as any);

    const response = await api.post('/meetings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Ensure audioUrl is set
    if (response.data && !response.data.audioUrl) {
      response.data.audioUrl = `${meetingsApi.getBaseUrl()}/meetings/${response.data.id}/audio`;
    }

    return response.data;
  } catch (error) {
    console.error('Failed to create meeting:', error);
    throw error;
  }
}



export type ActionStatus = 'not_reviewed' | 'pending' | 'in_progress' | 'completed';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration?: number;
  transcript?: string;
  summary?: string;
  highlights?: string[];
  status: 'pending' | 'processing' | 'processed' | 'failed';
  error?: string;
  audioPath?: string;
  audioUrl?: string;
  actions?: Action[];
}

export interface Action {
  id: string;
  title: string;
  meetingId: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: ActionStatus;
  notes?: string;
  details?: string;
  archived?: boolean;
  hasBeenOpened?: boolean;
  completedAt?: string;
}

export interface ArchivedMeeting {
  id: string;
  originalMeetingId: string;
  title: string;
  date: string;
  duration?: number;
  transcript?: string;
  audioUrl?: string;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export const meetingsApi = {
  // Get all meetings
  getAll: async (): Promise<Meeting[]> => {
    try {
      const response = await api.get<Meeting[]>('/meetings');
      return response.data;
    } catch (error) {
      console.error('Failed to load meetings:', error);
      throw error;
    }
  },

  // Create new meeting with audio
  create: async (data: { title: string; audioUri: string; duration: number }) => {
    console.log('Creating meeting with data:', data);

    try {
      // Check if audio file exists
      const audioInfo = await FileSystem.getInfoAsync(data.audioUri);
      console.log('Audio info:', audioInfo);

      if (!audioInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // Create form data
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('duration', data.duration.toString());

      // Get file extension and type
      const uriParts = data.audioUri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      const mimeType = `audio/${fileType === 'm4a' ? 'mp4' : fileType}`;

      // Append the audio file directly
      formData.append('audio', {
        uri: data.audioUri,
        name: `recording.${fileType}`,
        type: mimeType,
      } as any);

      // Send the request
      const response = await api.post('/meetings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for upload
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw error;
    }
  },

  getBaseUrl: () => BASE_URL,

  // Get single meeting
  getById: async (id: string): Promise<Meeting | null> => {
    try {
      const response = await api.get<Meeting>(`/meetings/${id}`);
      const meeting = response.data;
      
      // Ensure audioUrl is properly formatted
      if (meeting) {
        meeting.audioUrl = meetingsApi.normalizeAudioUrl(meeting.audioUrl, meeting.id);
        console.log('Normalized audio URL:', meeting.audioUrl);
      }
      
      return meeting;
    } catch (error) {
      console.error('Failed to load meeting:', error);
      return null;
    }
  },

  // Get meeting audio
  getAudio: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/meetings/${id}/audio`, {
        responseType: 'blob' // Important for binary data
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get audio for meeting ${id}:`, error);
      throw error;
    }
  },

  // Get audio URL for a meeting
  getAudioUrl: (meetingId: string): string => {
    return `${BASE_URL}/meetings/${meetingId}/audio`;
  },

  // Normalize audio URL to ensure it's complete
  normalizeAudioUrl: (url: string | undefined, meetingId?: string, attemptCount: number = 0): string | undefined => {
    if (!url) {
      if (meetingId) {
        // If no URL but we have meeting ID, generate standard URL with cache-busting
        const timestamp = Date.now();
        const fallbackParam = attemptCount > 0 ? '&fallback=true' : '';
        return `${BASE_URL}/meetings/${meetingId}/audio?t=${timestamp}${fallbackParam}`;
      }
      return undefined;
    }
    
    // Add cache-busting timestamp to prevent caching issues
    const addTimestamp = (u: string): string => {
      const hasParams = u.includes('?');
      return `${u}${hasParams ? '&' : '?'}t=${Date.now()}`;
    };
    
    // If URL is already absolute (http, https, file), add timestamp but otherwise return as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
      return addTimestamp(url);
    }
    
    // Handle local file paths from database (like /Users/...)    
    if (url.startsWith('/Users/') || url.startsWith('/var/') || url.indexOf('/uploads/audio/') !== -1) {
      console.log('Local file path detected, using meeting ID endpoint instead:', url);
      if (meetingId) {
        const timestamp = Date.now();
        const fallbackParam = attemptCount > 0 ? '&fallback=true' : '';
        return `${BASE_URL}/meetings/${meetingId}/audio?t=${timestamp}${fallbackParam}`;
      }
    }
    
    // If URL is relative to API, make it absolute
    if (url.startsWith('/')) {
      return addTimestamp(`${BASE_URL}${url}`);
    }
    
    // If URL is just a meeting ID or path fragment
    if (meetingId) {
      const timestamp = Date.now();
      const fallbackParam = attemptCount > 0 ? '&fallback=true' : '';
      return `${BASE_URL}/meetings/${meetingId}/audio?t=${timestamp}${fallbackParam}`;
    }
    
    console.warn('Unable to normalize audio URL:', url);
    return addTimestamp(url);
  },

  // Get all archived meetings
  async getArchived(): Promise<ArchivedMeeting[]> {
    try {
      const response = await api.get('/meetings/archived');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch archived meetings:', error);
      throw error;
    }
  },

  // Archive meeting
  async archiveMeeting(id: string): Promise<void> {
    try {
      console.log(`Archiving meeting with ID: ${id}`);
      // Fix: Make sure we're using the correct endpoint format
      const response = await api.post(`/meetings/${id}/archive`, {});
      return response.data;
    } catch (error) {
      console.error('Failed to archive meeting:', error);
      throw error;
    }
  },

  // Delete meeting
  async deleteMeeting(id: string): Promise<void> {
    const response = await api.delete(`${BASE_URL}/meetings/${id}`);
    return response.data;
  },

  // Delete meeting
  delete: async (id: string) => {
    try {
      await api.delete(`/meetings/${id}`);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      throw error;
    }
  },
};

export const actionsApi = {
  // Utility to get Base URL for other components to use
  getBaseUrl: () => BASE_URL,

  // Get all actions
  getAll: async (filters?: { status?: 'pending' | 'completed' }): Promise<Action[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const response = await api.get(`/actions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get actions:', error);
      throw new Error('Failed to get actions');
    }
  },

  // Get archived actions
  getArchived: async (): Promise<Action[]> => {
    try {
      console.log('🔍 Attempting to fetch archived actions...');
      // First try to get from dedicated API endpoint
      try {
        // Use query parameter instead of path parameter to avoid UUID parsing errors
        const response = await api.get('/actions?archived=true');
        console.log('✅ Successfully retrieved archived actions from API endpoint');
        // Don't filter again, trust the server response
        return response.data;
      } catch (apiError) {
        console.log('⚠️ API endpoint for archived actions not available, falling back to client filtering');

        // Fallback: Get all actions and filter on client side
        console.log('🔍 Fetching all actions to filter...');
        const allActions = await actionsApi.getAll();
        console.log(`ℹ️ Total actions retrieved: ${allActions.length}`);

        // Check for actions explicitly marked as archived
        let archivedActions = allActions.filter(action => action.archived === true);

        // If no explicitly archived actions found, also include completed actions that should be archived
        if (archivedActions.length === 0) {
          console.log('⚠️ No actions with archived=true found, checking for completed actions...');

          // Find completed actions that should be considered archived
          // Include ALL completed tasks regardless of archived flag (to match archived.tsx behavior)
          const completedActions = allActions.filter(action =>
            action.status === 'completed'
            // Removed !action.archived condition to show all completed tasks
          );

          if (completedActions.length > 0) {
            console.log(`🔢 Found ${completedActions.length} completed actions that could be considered archived`);
            // Mark these as archived for UI display
            archivedActions = [...archivedActions, ...completedActions.map(action => ({
              ...action,
              archived: true // Set archived flag for display purposes
            }))];
          }
        }

        if (archivedActions.length > 0) {
          console.log(`✅ Found ${archivedActions.length} archived actions`);
          archivedActions.forEach(action => {
            console.log(`📄 Archived action: ${action.id} - ${action.title} - Status: ${action.status}`);
          });
        }

        return archivedActions;
      }
    } catch (error) {
      console.error('❌ Failed to get archived actions:', error);
      return []; // Return empty array on error instead of throwing
    }
  },

  // Get actions by meeting
  getByMeeting: async (meetingId: string): Promise<Action[]> => {
    try {
      const response = await api.get(`/actions/meeting/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get actions for meeting ${meetingId}:`, error);
      throw new Error('Failed to get actions for meeting');
    }
  },

  // Get action by ID
  getById: async (id: string): Promise<Action | null> => {
    try {
      const response = await api.get(`/actions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get action ${id}:`, error);
      return null;
    }
  },

  // Create new action
  create: async (action: Omit<Action, 'id'>): Promise<Action> => {
    try {
      const response = await api.post('/actions', action);
      return response.data;
    } catch (error) {
      console.error('Failed to create action:', error);
      throw new Error('Failed to create action');
    }
  },

  // Update action
  update: async (id: string, updates: Partial<Action>): Promise<Action> => {
    try {
      console.log(`💾 Updating action ${id} with:`, updates);

      // If we're archiving, ensure the status is set to completed
      if (updates.archived === true && !updates.status) {
        console.log('⚙️ Setting status to completed for archived action');
        updates.status = 'completed';
      }

      // If we're archiving, ensure completedAt is set
      if (updates.archived === true && !updates.completedAt) {
        updates.completedAt = new Date().toISOString();
      }

      const response = await api.put(`/actions/${id}`, updates);
      console.log(`✅ Action ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update action ${id}:`, error);
      throw new Error('Failed to update action');
    }
  },

  // Save only notes and title (special update method)
  saveNotes: async (id: string, updates: { title: string; notes: string }): Promise<Action> => {
    try {
      const response = await api.put(`/actions/${id}/notes`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to save notes for action ${id}:`, error);
      throw new Error('Failed to save action notes');
    }
  },

  // Update action status
  updateStatus: async (id: string, status: Action['status']): Promise<void> => {
    try {
      await api.patch(`/actions/${id}/status`, { status });
    } catch (error) {
      console.error(`Failed to update status for action ${id}:`, error);
      throw new Error('Failed to update action status');
    }
  },

  // Delete action
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/actions/${id}`);
    } catch (error) {
      console.error(`Failed to delete action ${id}:`, error);
      throw new Error('Failed to delete action');
    }
  },

  // Cleanup pending actions - can be used to bulk delete, complete, or archive
  cleanup: async (action: 'delete' | 'complete' | 'archive', meetingId?: string): Promise<{ message: string }> => {
    try {
      console.log(`🔎 Cleaning up actions with operation: ${action}, meetingId: ${meetingId || 'all'}`);

      // For archive operation, ensure we're setting all required fields
      if (action === 'archive') {
        // If the archive endpoint doesn't exist or fails, manually archive each item
        try {
          const response = await api.post('/actions/cleanup', { action, meetingId });
          console.log('✅ Bulk archive operation successful');
          return response.data;
        } catch (apiError) {
          console.log('⚠️ Bulk archive API failed, falling back to manual archiving');

          // Get all actions that should be archived (filter by meetingId if provided)
          const allActions = await actionsApi.getAll();
          const actionsToArchive = meetingId
            ? allActions.filter(a => a.meetingId === meetingId)
            : allActions.filter(a => a.status === 'completed' && !a.archived);

          console.log(`📄 Manually archiving ${actionsToArchive.length} actions`);

          // Archive each action
          for (const action of actionsToArchive) {
            await actionsApi.update(action.id, {
              archived: true,
              status: 'completed',
              completedAt: new Date().toISOString()
            });
          }

          return { message: `Manually archived ${actionsToArchive.length} actions` };
        }
      }

      const response = await api.post('/actions/cleanup', { action, meetingId });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to cleanup pending actions:', error);
      throw new Error('Failed to cleanup pending actions');
    }
  },

  // Batch update actions
  batchUpdate: async (ids: string[], updates: Partial<Action>): Promise<Action[]> => {
    try {
      const response = await api.put('/actions/batch', { ids, updates });
      return response.data;
    } catch (error) {
      console.error('Failed to batch update actions:', error);
      throw new Error('Failed to batch update actions');
    }
  },
  // Add to your api.ts file
  getUserStats: async (): Promise<{ totalRecordedTime: number; remainingFreeTime: number }> => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return { totalRecordedTime: 0, remainingFreeTime: 14400 }; // Default to 4 hours (in seconds)
    }
  },
};


export default {
  meetings: meetingsApi,
  actions: actionsApi,
};
