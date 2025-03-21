import { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import BannerMessage from '../components/BannerMessage';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { meetingsApi, actionsApi } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recordStyles from '../styles/record';
import { AppState } from 'react-native';
import globalStyles from '../styles/globalStyles';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [title, setTitle] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const router = useRouter();
  // Inside your RecordScreen component
  const { isPremium } = useUser();
  const isGuestUser = !isPremium;
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [remainingFreeTime, setRemainingFreeTime] = useState(14400); // 4 hours in seconds
  const MAX_FREE_RECORDING_TIME = 14400; // 4 hours in seconds

  // Banner will be rendered in the return statement

  useEffect(() => {
    if (isGuestUser) {
      const fetchUserStats = async () => {
        try {
          // Get user stats - this will use the default values if the API fails
          const stats = await actionsApi.getUserStats();
          console.log('User stats loaded:', stats);
          setRemainingFreeTime(stats.remainingFreeTime);

          // For testing purposes, always show the banner for guest users
          // In production, you might want to use: stats.remainingFreeTime < 300
          setShowUpgradeBanner(true);
        } catch (error) {
          console.error('Failed to load user stats:', error);
          // Keep default values
          setRemainingFreeTime(MAX_FREE_RECORDING_TIME);
        }
      };

      fetchUserStats();
    }
  }, [isGuestUser, MAX_FREE_RECORDING_TIME]);


  // Initialize audio session
  useEffect(() => {
    const initAudioSession = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        Alert.alert('Error', 'Failed to initialize audio. Please check app permissions.');
      }
    };

    initAudioSession();
  }, []);

  // Persist recording state in storage
  useEffect(() => {
    if (recording) {
      const state = {
        title,
        timer,
        isPaused,
        isRecording: true
      };
      AsyncStorage.setItem('recordingState', JSON.stringify(state));
    }
  }, [recording, title, timer, isPaused]);

  // Restore state when tab is focused
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('recordingState');
        if (savedState) {
          const state = JSON.parse(savedState);
          // Only restore state if there was an active recording
          if (state.isRecording) {
            setTitle(state.title);
            setTimer(state.timer);
            setIsPaused(state.isPaused);
          } else {
            await clearRecordingState();
          }
        }
      } catch (error) {
        console.error('Failed to load recording state:', error);
      }
    };
    loadState();
  }, []);

  // Clear state after successful upload or when explicitly leaving the screen
  const clearRecordingState = async () => {
    try {
      await AsyncStorage.removeItem('recordingState');
      setRecording(null);
      recordingRef.current = null;
      setTitle('');
      setTimer(0);
      setIsPaused(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error('Failed to clear recording state:', error);
    }
  };

  // Handle app background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App came to foreground
        console.log('App came to foreground');
      } else if (nextAppState === 'background') {
        // App went to background
        console.log('App went to background');
        if (recording) {
          // Save current state
          const state = {
            title,
            timer,
            isPaused,
            isRecording: true
          };
          AsyncStorage.setItem('recordingState', JSON.stringify(state));
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [recording, title, timer, isPaused]);

  const startRecording = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Please enter a Title for the recording');
        return;
      }

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      recordingRef.current = recording;
      setIsPaused(false);

      // Start timer
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);

    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please check app permissions.');
    }
  };

  const togglePause = async () => {
    try {
      const currentRecording = recordingRef.current;
      if (!currentRecording) return;

      if (isPaused) {
        await currentRecording.startAsync();
        setIsPaused(false);
        const interval = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
      } else {
        await currentRecording.pauseAsync();
        setIsPaused(true);
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle pause:', err);
    }
  };

  const stopRecording = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    try {
      const currentRecording = recordingRef.current;
      if (!currentRecording) {
        console.warn('No active recording found');
        return;
      }

      console.log('Stopping recording...');
      setIsProcessing(true);

      // Get the URI before stopping the recording
      const uri = currentRecording.getURI();
      console.log('Recording URI:', uri);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      try {
        // Stop the recording
        await currentRecording.stopAndUnloadAsync();

        // Upload the recording
        await meetingsApi.create({
          title,
          audioUri: uri,
          duration: timer,
        });

        // Clear state and navigate only after successful upload
        await clearRecordingState();
        router.push('/(tabs)/meetings');
      } catch (uploadError) {
        console.error('Failed to process or upload recording:', uploadError);

        // Keep the state but show error
        Alert.alert(
          'Upload Failed',
          'Failed to upload the recording. The recording will be preserved until you try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert(
        'Recording Error',
        'Failed to stop recording. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={recordStyles.container}>
        {isGuestUser && showUpgradeBanner && (
          <BannerMessage
            remainingMinutes={Math.floor(remainingFreeTime / 60)}
            onUpgrade={() => router.push('/upgrade' as any)}
          />
        )}
        <View style={recordStyles.inputContainer}>
          <TextInput
            style={recordStyles.input}
            placeholder="Enter meeting title"
            placeholderTextColor="#666666"
            value={title}
            onChangeText={setTitle}
            editable={!recording}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        <View style={recordStyles.timerContainer}>
          <Text style={recordStyles.timer}>{formatTime(timer)}</Text>
        </View>

        <View style={recordStyles.buttonContainer}>
          <TouchableOpacity
            style={[recordStyles.recordButton, recording && recordStyles.stopButton]}
            onPress={recording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <MaterialIcons
              name={recording ? "stop" : "mic"}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {recording && (
            <TouchableOpacity
              style={[recordStyles.pauseButton, isPaused && recordStyles.resumeButton]}
              onPress={togglePause}
              disabled={isProcessing}
            >
              <MaterialIcons
                name={isPaused ? "play-arrow" : "pause"}
                size={28}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
        {isProcessing && (
          <View style={recordStyles.processingContainer}>
            <Text style={recordStyles.processingText}>Processing recording...</Text>
          </View>
        )}

      </View>
    </TouchableWithoutFeedback>
  );
}
