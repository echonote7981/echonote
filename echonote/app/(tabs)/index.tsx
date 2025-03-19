import { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Text,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { meetingsApi } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import recordStyles from '../styles/record';
import { AppState } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Firebase imports
import { saveRecording } from '../utils/firestoreUtils';
import { authenticateUser } from '../utils/userUtils';
import { useUser } from '../context/UserContext';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Maximum recording time for guest users (4 hours in seconds)
const MAX_GUEST_RECORDING_TIME = 14400;

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [title, setTitle] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const router = useRouter();

  // Get user data from context
  const { isPremium, recordingTime, saveRecordingTime } = useUser();
  
  // User status states
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize user authentication and load user data
  useEffect(() => {
    const initUser = async () => {
      try {
        // Get the authenticated user ID
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedUserId) {
          // If no user ID is found, authenticate with Firebase
          const newUserId = await authenticateUser();
          setUserId(newUserId);
        } else {
          setUserId(storedUserId);
        }

        // No need to check premium status or load recording time here
        // as we're now using the UserContext for this data
      } catch (err) {
        console.error('Error initializing user:', err);
        // We don't need to fall back to local storage anymore
        // since UserContext handles this for us
      }
    };

    initUser();
  }, []);



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

  // Effect to check and set upgrade banner visibility based on user premium status
  useEffect(() => {
    // Simply show the banner for all non-premium users
    if (!isPremium) {
      setShowUpgradeBanner(true);
    } else {
      // Premium users never see the banner
      setShowUpgradeBanner(false);
    }
  }, [isPremium]);

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

      // Check recording limit using the context data
      if (!isPremium && recordingTime >= MAX_GUEST_RECORDING_TIME) {
        Alert.alert(
          'Recording Limit Reached',
          'You have reached the 4-hour limit for guest users. Unlock unlimited recording time by upgrading to Premium!',
          [
            { text: 'Upgrade Now', onPress: navigateToUpgradeScreen },
            { text: 'Maybe Later', style: 'cancel' }
          ]
        );
        return;
      }

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      recordingRef.current = recording;
      setIsPaused(false);

      // Start the timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev + 1;

          if (!isPremium && recordingTime + newTime >= MAX_GUEST_RECORDING_TIME - 300) {
            setShowUpgradeBanner(true); // Show banner when 5 min left
          }

          if (!isPremium && recordingTime + newTime >= MAX_GUEST_RECORDING_TIME) {
            stopRecording();
          }

          return newTime;
        });
      }, 1000);

      setTimerInterval(interval);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not start recording. Please try again.');
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

        // Create a unique ID for the recording
        const recordingId = uuidv4();

        // Save to API (don't include recordingId here - it will be generated by the server)
        await meetingsApi.create({
          title,
          audioUri: uri,
          duration: timer
        });

        // If we have a user ID, save to Firestore
        if (userId) {
          const recordingData = {
            id: recordingId,
            title,
            audioUri: uri,
            duration: timer,
            createdAt: new Date()
          };

          // Save recording metadata to Firestore
          await saveRecording(userId, recordingData);

        }

        // Update total recording time using the context method
        await saveRecordingTime(timer);

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

  // Function to navigate to the upgrade page
  const navigateToUpgradeScreen = () => {
    // Navigate to the upgrade screen or show upgrade modal
    router.push('/subscription');
    console.log('Navigating to upgrade screen');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={recordStyles.container}>
        {/* Upgrade Banner - Single instance at the top of the screen */}
        {showUpgradeBanner && (
          <View style={recordStyles.banner}>
            <Text style={recordStyles.bannerText}>
              {recording
                ? `${formatTime(Math.max(0, MAX_GUEST_RECORDING_TIME - recordingTime - timer))} of recording time left`
                : `${formatTime(Math.max(0, MAX_GUEST_RECORDING_TIME - recordingTime))} of total recording time available`
              }
            </Text>
            
            {/* Visual progress indicator */}
            <View style={recordStyles.recordingLimitContainer}>
              <View 
                style={[recordStyles.recordingLimitFill, { 
                  width: `${Math.min(100, (recordingTime / MAX_GUEST_RECORDING_TIME) * 100)}%` 
                }]}
              />
            </View>
            
            <TouchableOpacity onPress={navigateToUpgradeScreen}>
              <Text style={recordStyles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
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

        {/* Banner has been moved to the top of the container */}
      </View>
    </TouchableWithoutFeedback>
  );
}
