import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import audioStyles from '../styles/audioPlayer';
import { meetingsApi } from '../services/api';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  meetingId?: string;
  onPositionChange?: (position: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayingStateChange?: (isPlaying: boolean) => void;
}



const formatTime = (milliseconds: number): string => {
  if (!milliseconds) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Define the ref interface
export interface AudioPlayerRef {
  pauseAudio: () => Promise<void>;
  playAudio: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ 
  audioUrl, 
  duration = 0, 
  meetingId,
  onPositionChange,
  onDurationChange,
  onPlayingStateChange
}, ref) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration * 1000);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Setup audio session for proper playback in different app states with enhanced volume
  useEffect(() => {
    const setupAudioSession = async () => {
      try {
        // Platform-specific audio session configuration
        const isIOS = Platform.OS === 'ios';
        
        if (isIOS) {
          // First, ensure audio is enabled
          await Audio.setIsEnabledAsync(true);
          
          // Configure iOS-specific settings with more conservative values
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            allowsRecordingIOS: false, // Optimize for playback
          });
          
          console.log('iOS-specific audio session setup for large files');
        } else {
          // Android configuration
          await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            shouldDuckAndroid: false, // Don't lower volume for other apps
            playThroughEarpieceAndroid: false, // Use speaker instead of earpiece
          });
          
          console.log('Android audio session setup successfully');
        }
      } catch (error) {
        console.error('Failed to setup audio session:', error);
      }
    };

    setupAudioSession();
  }, []);

  // iOS-specific loading function that bypasses file download
  const loadSoundForIOS = async () => {
    try {
      // Normalize audio URL from various formats
      const normalizedUrl = audioUrl 
        ? meetingsApi.normalizeAudioUrl(audioUrl, meetingId, retryCount) 
        : meetingsApi.normalizeAudioUrl(undefined, meetingId, retryCount);
        
      if (!normalizedUrl) {
        setErrorMessage('No audio available for this meeting.');
        setIsLoading(false);
        return;
      }
      
      console.log('iOS - Meeting ID:', meetingId);
      console.log('iOS - Original audio URL:', audioUrl);
      console.log('iOS - Normalized URL:', normalizedUrl);
      
      // For iOS, we'll skip the file download and use direct streaming
      // with specialized parameters to avoid AVFoundationErrorDomain errors
      const streamingParams = 'stream=true&iosOptimized=true';
      const streamingUrl = normalizedUrl.includes('?') 
        ? `${normalizedUrl}&${streamingParams}` 
        : `${normalizedUrl}?${streamingParams}`;
      
      console.log('iOS - Using direct streaming URL:', streamingUrl);
      
      // Create iOS-specific playback options with conservative settings
      const iosPlaybackOptions = {
        shouldPlay: false,
        volume: 1.0,
        progressUpdateIntervalMillis: 200, // Less frequent updates to reduce overhead
        positionMillis: 0,
        rate: 1.0,
        shouldCorrectPitch: true
      };
      
      console.log('iOS - Using specialized playback options:', iosPlaybackOptions);
      
      // Load directly from the streaming URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamingUrl },
        iosPlaybackOptions,
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setIsLoading(false);
      setErrorMessage(null);
      console.log('iOS - Audio loaded successfully with direct streaming');
      
      // Apply volume boost for better audibility
      await newSound.setVolumeAsync(1.0);
      
    } catch (iosError) {
      console.error('iOS - Error loading audio with direct streaming:', iosError);
      
      // Try with explicit fallback parameters
      try {
        const apiBaseUrl = meetingsApi.getBaseUrl();
        // Use fallback with even more conservative settings
        const fallbackUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?fallback=true&stream=true&iosOptimized=true&lowMemory=true&t=${Date.now()}`;
        
        console.log('iOS - Trying fallback URL:', fallbackUrl);
        
        // Load with minimal options
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: fallbackUrl },
          { 
            shouldPlay: false,
            volume: 1.0,
            progressUpdateIntervalMillis: 500 // Very infrequent updates
          },
          onPlaybackStatusUpdate
        );
        
        setSound(newSound);
        setIsLoading(false);
        setErrorMessage(null);
        console.log('iOS - Audio loaded successfully with fallback URL');
        
      } catch (fallbackError) {
        console.error('iOS - All fallback attempts failed:', fallbackError);
        setErrorMessage('Could not load audio. Please try again.');
        setIsLoading(false);
      }
    }
  };
  
  // Load sound on component mount with URL normalization and retry functionality
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;
    
    const loadSound = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Unload any existing sound
        if (sound) {
          await sound.unloadAsync();
        }
        
        // For iOS, use a completely different approach to avoid AVFoundationErrorDomain errors
        const isIOS = Platform.OS === 'ios';
        if (isIOS) {
          await loadSoundForIOS();
          return;
        }
        
        // Normalize the audio URL using the utility from meetingsApi, passing retry count for fallback logic
        const normalizedUrl = meetingsApi.normalizeAudioUrl(audioUrl, meetingId, retryCount);
        
        if (!normalizedUrl) {
          setErrorMessage('No audio available for this meeting.');
          setIsLoading(false);
          return; // Exit early if no URL is available
        }
        
        console.log('Meeting ID:', meetingId);
        console.log('Original audio URL:', audioUrl);
        console.log('Normalized URL:', normalizedUrl);
        
        // Enhanced approach for handling large audio files with iOS-specific optimizations
        const apiBaseUrl = meetingsApi.getBaseUrl();
        // Include fallback parameter based on retry count
        const fallbackParam = retryCount > 0 ? '&fallback=true' : '';
        
        // Platform-specific parameters
        let platformParams = '';
        
        if (isIOS) {
          // iOS needs smaller chunks and different streaming approach
          // Use a smaller chunk size (512KB) for iOS to prevent memory issues
          platformParams = '&stream=true&chunk=true&chunkSize=512000&iosOptimized=true';
        } else {
          // Android can handle larger chunks
          platformParams = '&stream=true&chunk=true&chunkSize=1024000';
        }
        
        const fullApiUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?cb=${Date.now()}${fallbackParam}${platformParams}`;
        
        console.log('Attempting to download audio file from:', fullApiUrl, 'Retry count:', retryCount);
        
        // Create a unique local filename in the app's cache directory
        const localFilePath = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}meeting-audio-${meetingId}.mp3` : null;
        
        if (!localFilePath) {
          throw new Error('Cache directory not available');
        }
        
        // Log additional debugging information
        console.log('Meeting ID for audio:', meetingId);
        console.log('Cache directory:', FileSystem.cacheDirectory);
        
        try {
          // Check if we already have the file cached
          const fileInfo = await FileSystem.getInfoAsync(localFilePath);
          
          // If file doesn't exist or we want to force a fresh download, download it
          if (!fileInfo.exists || fileInfo.size === 0) {
            console.log('Downloading audio file to:', localFilePath);
            
            const downloadResult = await FileSystem.downloadAsync(
              fullApiUrl,
              localFilePath,
              {
                headers: {
                  'Cache-Control': 'no-cache'
                }
              }
            );
            
            console.log('Download complete:', downloadResult);
            
            // Verify file was downloaded successfully
            const downloadedFileInfo = await FileSystem.getInfoAsync(localFilePath);
            if (!downloadedFileInfo.exists || downloadedFileInfo.size === 0) {
              throw new Error('Downloaded file is empty or does not exist');
            }
          } else {
            console.log('Using cached audio file:', localFilePath);
          }
          
          // Now load the sound from the local file with platform-specific optimizations
          console.log('Loading sound from local file:', localFilePath);
          
          // Create platform-specific playback options
          const playbackOptions = {
            shouldPlay: false,
            volume: 1.0, // Maximum volume
            progressUpdateIntervalMillis: isIOS ? 100 : 50, // Less frequent on iOS to reduce overhead
            positionMillis: 0,
            rate: 1.0, // Normal playback rate
            shouldCorrectPitch: true, // Better audio quality
          };
          
          console.log(`Using ${Platform.OS}-optimized playback settings:`, playbackOptions);
          
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: localFilePath },
            playbackOptions,
            onPlaybackStatusUpdate
          );
          
          // Set initial volume to maximum
          await newSound.setVolumeAsync(1.0);
          
          setSound(newSound);
          setIsLoading(false); // Set loading to false when audio is loaded successfully
          console.log('Audio loaded successfully from local file');
          return;
          
        } catch (downloadError) {
          console.error('Error downloading or loading audio file:', downloadError);
          
          // If downloading fails, try direct approaches with different URL formats and iOS-specific optimizations
          // Add platform-specific streaming parameters
          const streamingParams = isIOS ? 'stream=true&iosOptimized=true' : 'stream=true';
          const streamingNormalizedUrl = normalizedUrl.includes('?') 
            ? `${normalizedUrl}&${streamingParams}` 
            : `${normalizedUrl}?${streamingParams}`;
          
          console.log(`Trying direct URL as first fallback with ${Platform.OS}-optimized streaming:`, streamingNormalizedUrl);
          
          try {
            // Create platform-specific playback options
            const directPlaybackOptions = {
              shouldPlay: false,
              volume: 1.0,
              progressUpdateIntervalMillis: isIOS ? 100 : 50, // Less frequent on iOS
              positionMillis: 0,
              rate: 1.0,
              shouldCorrectPitch: true
            };
            
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: streamingNormalizedUrl },
              directPlaybackOptions,
              onPlaybackStatusUpdate
            );
            setSound(newSound);
            console.log('Audio loaded successfully with direct URL');
            setIsLoading(false);
            return;
          } catch (directError) {
            console.error('Failed with direct URL:', directError);
            
            // Try with a raw API endpoint as second fallback with platform-specific optimizations
            // Use platform-specific parameters
            const rawChunkSize = isIOS ? '512000' : '1024000';
            const iosParam = isIOS ? '&iosOptimized=true' : '';
            const rawApiUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?raw=true&stream=true&chunk=true&chunkSize=${rawChunkSize}${iosParam}&t=${Date.now()}`;
            
            console.log(`Trying raw API endpoint as second fallback with ${Platform.OS}-optimized streaming:`, rawApiUrl);
            
            try {
              const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: rawApiUrl },
                { 
                  shouldPlay: false,
                  volume: 1.0, // Maximum volume
                  progressUpdateIntervalMillis: 100, // More frequent updates for better sync
                  positionMillis: 0,
                  rate: 1.0, // Normal playback rate
                  shouldCorrectPitch: true, // Better audio quality
                },
                onPlaybackStatusUpdate
              );
              
              // Set initial volume to maximum
              await newSound.setVolumeAsync(1.0);
              setSound(newSound);
              console.log('Audio loaded successfully with raw API URL');
              setIsLoading(false);
              return;
            } catch (rawApiError) {
              console.error('Failed with raw API URL:', rawApiError);
              
              // Try with explicit fallback parameter as third fallback with platform-specific optimizations
              // Use platform-specific parameters
              const fallbackChunkSize = isIOS ? '512000' : '1024000';
              const iosFallbackParam = isIOS ? '&iosOptimized=true&lowMemory=true' : '';
              const fallbackUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?fallback=true&stream=true&chunk=true&chunkSize=${fallbackChunkSize}${iosFallbackParam}&t=${Date.now()}`;
              
              console.log(`Trying explicit fallback URL as third fallback with ${Platform.OS}-optimized streaming:`, fallbackUrl);
              
              try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                  { uri: fallbackUrl },
                  { 
                    shouldPlay: false,
                    volume: 1.0, // Maximum volume
                    progressUpdateIntervalMillis: 100, // More frequent updates for better sync
                    positionMillis: 0,
                    rate: 1.0, // Normal playback rate
                    shouldCorrectPitch: true, // Better audio quality
                  },
                  onPlaybackStatusUpdate
                );
                
                // Set initial volume to maximum
                await newSound.setVolumeAsync(1.0);
                setSound(newSound);
                console.log('Audio loaded successfully with fallback URL');
                setIsLoading(false);
                return;
              } catch (fallbackError) {
                console.error('Failed with fallback URL:', fallbackError);
                throw new Error('All audio loading methods failed');
              }
            }
          }
        }
        
        // This block is no longer needed as we return early in the successful cases
        // and throw errors in the failure cases
      } catch (error) {
        console.error('Error loading audio:', error);
        
        if (isMounted) {
          setIsLoading(false);
          
          // Re-declare isIOS here since it's not accessible in this scope
          const isIOS = Platform.OS === 'ios';
          
          // Check if the error is related to missing file (404) or connection issues
          const errorString = String(error);
          console.error('Audio loading error details:', errorString);
          
          if (errorString.includes('404') || 
              errorString.includes('not found') || 
              errorString.includes('NSURLErrorDomain') ||
              errorString.includes('AVFoundationErrorDomain') ||
              errorString.includes('-11800')) {
            // For NSURLErrorDomain or AVFoundationErrorDomain errors, provide more specific information
            if (errorString.includes('NSURLErrorDomain') || errorString.includes('AVFoundationErrorDomain') || errorString.includes('-11800')) {
              const errorType = isIOS ? 'iOS AVFoundationErrorDomain' : 'Network or media';
              const platformName = isIOS ? 'iOS' : 'Android';
              console.log(`${errorType} error detected (possibly due to large file size), trying fallback options with ${platformName}-optimized streaming`);
              if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                setErrorMessage(`Audio file not found. Trying alternative sources... (${retryCount + 1}/${MAX_RETRIES})`);
                
                // Retry with fallback parameter
                retryTimeout = setTimeout(() => {
                  if (isMounted) loadSound();
                }, 1500);
                return;
              }
            }
            
            setErrorMessage('No audio available for this meeting. The audio file may not have been saved properly.');
            setIsLoading(false);
            return;
          }
          
          // Handle retry logic for other types of errors
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setErrorMessage(`Loading failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            
            // Retry after a short delay
            retryTimeout = setTimeout(() => {
              if (isMounted) loadSound();
            }, 1500);
          } else {
            setErrorMessage('Failed to load audio. Please try again later.');
          }
        }
      }
    };
    
    if (audioUrl) {
      loadSound();
    }
    
    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl, meetingId, retryCount]);

  // Update playback status with more precise position tracking
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    
    const currentPosition = status.positionMillis || 0;
    
    if (!isSeeking) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setPosition(currentPosition);
        setSliderValue(currentPosition);
        
        // Call position change callback if provided
        if (onPositionChange) {
          // Send precise position with timestamp for better synchronization
          onPositionChange(currentPosition);
        }
      });
    }
    
    if (status.isLoaded && status.durationMillis) {
      // Only update if different to avoid unnecessary re-renders
      if (totalDuration !== status.durationMillis) {
        setTotalDuration(status.durationMillis);
        
        // Call duration change callback if provided
        if (onDurationChange) {
          onDurationChange(status.durationMillis);
        }
      }
    }
    
    // Only update if the playing state has changed to avoid unnecessary re-renders
  if (isPlaying !== status.isPlaying) {
    setIsPlaying(status.isPlaying);
    
    // Call playing state change callback if provided
    if (onPlayingStateChange) {
      onPlayingStateChange(status.isPlaying);
    }
  }
  };

  // Pause audio (exposed via ref)
  const pauseAudio = async () => {
    if (!sound || !isPlaying) return;
    
    try {
      await sound.pauseAsync();
      console.log('Audio paused successfully via ref');
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };
  
  // Play audio (exposed via ref) with enhanced audio settings
  const playAudio = async () => {
    if (!sound || isPlaying) return;
    
    try {
      // Apply audio enhancements before playing
      await sound.setVolumeAsync(1.0);
      await sound.setRateAsync(1.0, true); // Normal rate with pitch correction for better quality
      
      // On iOS, we can use this to route audio to the built-in speaker
      const isIOS = Platform.OS === 'ios';
      if (isIOS) {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
            allowsRecordingIOS: false,
          });
        } catch (error) {
          console.error('Error setting audio mode during playback:', error);
        }
      }
      
      await sound.playAsync();
      console.log('Enhanced audio playing successfully via ref');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Play/pause toggle with error handling and volume boost
  const togglePlayback = async () => {
    if (!sound) {
      console.log('No sound object available');
      return;
    }
    
    try {
      if (isPlaying) {
        await pauseAudio();
      } else {
        // Ensure maximum volume before playing
        await sound.setVolumeAsync(1.0);
        await playAudio();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setErrorMessage('Error playing audio. Please try again.');
    }
  };

  // Seek to position
  const seekTo = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
    setPosition(value);
    
    // Call position change callback when seeking
    if (onPositionChange) {
      onPositionChange(value);
    }
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    pauseAudio,
    playAudio,
    seekTo
  }));

  // Handle slider events
  const onSlidingStart = () => {
    setIsSeeking(true);
  };
  
  const onSlidingComplete = (value: number) => {
    seekTo(value);
    setIsSeeking(false);
  };
  
  const onValueChange = (value: number) => {
    setSliderValue(value);
  };

  // Rewind 10 seconds
  const rewind = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 10000);
    await seekTo(newPosition);
  };

  // Forward 10 seconds
  const forward = async () => {
    if (!sound) return;
    const newPosition = Math.min(totalDuration, position + 10000);
    await seekTo(newPosition);
  };

  // Manual retry with platform-specific optimizations
  const handleRetry = async () => {
    const isIOS = Platform.OS === 'ios';
    const retryMessage = isIOS ? 'Retrying with iOS direct streaming...' : 'Retrying...';
    setErrorMessage(retryMessage);
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    
    try {
      // Unload any existing sound first
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // For iOS, use a completely different approach on retry
      if (isIOS) {
        // Force direct streaming approach for iOS
        await loadSoundForIOS();
        return;
      }
      
      // For Android, use the normal approach with fallback parameters
      if (meetingId) {
        const apiBaseUrl = meetingsApi.getBaseUrl();
        const platformParams = '&stream=true&chunk=true&chunkSize=1024000';
        const fallbackUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?fallback=true${platformParams}&t=${Date.now()}`;
        console.log(`Manual retry with Android-optimized fallback URL:`, fallbackUrl);
      }
    } catch (error) {
      console.error('Error during retry:', error);
      setErrorMessage('Failed to retry. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={audioStyles.container}>
      {isLoading ? (
        <View style={audioStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#0A84FF" />
          <Text style={audioStyles.loadingText}>Loading audio...</Text>
        </View>
      ) : errorMessage ? (
        <View style={audioStyles.errorContainer}>
          <Text style={audioStyles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={audioStyles.retryButton} onPress={handleRetry}>
            <Text style={audioStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Slider
            style={audioStyles.slider}
            minimumValue={0}
            maximumValue={totalDuration || 1}
            value={sliderValue}
            minimumTrackTintColor="#0A84FF"
            maximumTrackTintColor="#4A4A4A"
            thumbTintColor="#0A84FF"
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            onValueChange={onValueChange}
          />
          
          <View style={audioStyles.controlsContainer}>
            <Text style={audioStyles.timeText}>{formatTime(position)}</Text>
            
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={audioStyles.controlButton} onPress={rewind}>
                <MaterialIcons name="replay-10" size={20} color="#AAAAAA" />
              </TouchableOpacity>
              
              <TouchableOpacity style={audioStyles.playButton} onPress={togglePlayback}>
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={audioStyles.controlButton} onPress={forward}>
              <MaterialIcons name="forward-10" size={20} color="#AAAAAA" />
            </TouchableOpacity>
            </View>
            
            <Text style={audioStyles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
        </>
      )}
    </View>
  );
});

export default AudioPlayer;