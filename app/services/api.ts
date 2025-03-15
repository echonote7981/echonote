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
    return '192.168.1.40'; // Your local IP address
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

  // Get single meeting
  getById: async (id: string): Promise<Meeting | null> => {
    try {
      const response = await api.get<Meeting>(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to load meeting:', error);
      return null;
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
      const response = await api.post(`/meetings/${id}/archive`);
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
      const response = await api.put(`/actions/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update action ${id}:`, error);
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
};

export default {
  meetings: meetingsApi,
  actions: actionsApi,
};
