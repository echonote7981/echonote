import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import audioStyles from '../styles/audioPlayer';
import { meetingsApi } from '../services/api';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  meetingId?: string;
}



const formatTime = (milliseconds: number): string => {
  if (!milliseconds) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, duration = 0, meetingId }) => {
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

  // Setup audio session for proper playback in different app states
  useEffect(() => {
    const setupAudioSession = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio session setup successfully');
      } catch (error) {
        console.error('Failed to setup audio session:', error);
      }
    };

    setupAudioSession();
  }, []);

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
        
        // New approach: Download the file first, then play it locally
        // This avoids URL formatting issues that may be causing NSURLErrorDomain errors
        const apiBaseUrl = meetingsApi.getBaseUrl();
        // Include fallback parameter based on retry count
        const fallbackParam = retryCount > 0 ? '&fallback=true' : '';
        const fullApiUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?cb=${Date.now()}${fallbackParam}`;
        
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
          
          // Now load the sound from the local file
          console.log('Loading sound from local file:', localFilePath);
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: localFilePath },
            { shouldPlay: false },
            onPlaybackStatusUpdate
          );
          
          setSound(newSound);
          setIsLoading(false); // Set loading to false when audio is loaded successfully
          console.log('Audio loaded successfully from local file');
          return;
          
        } catch (downloadError) {
          console.error('Error downloading or loading audio file:', downloadError);
          
          // If downloading fails, try direct approaches with different URL formats
          console.log('Trying direct URL as first fallback:', normalizedUrl);
          try {
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: normalizedUrl },
              { shouldPlay: false },
              onPlaybackStatusUpdate
            );
            setSound(newSound);
            console.log('Audio loaded successfully with direct URL');
            setIsLoading(false);
            return;
          } catch (directError) {
            console.error('Failed with direct URL:', directError);
            
            // Try with a raw API endpoint as second fallback
            const rawApiUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?raw=true&t=${Date.now()}`;
            console.log('Trying raw API endpoint as second fallback:', rawApiUrl);
            
            try {
              const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: rawApiUrl },
                { shouldPlay: false },
                onPlaybackStatusUpdate
              );
              setSound(newSound);
              console.log('Audio loaded successfully with raw API URL');
              setIsLoading(false);
              return;
            } catch (rawApiError) {
              console.error('Failed with raw API URL:', rawApiError);
              
              // Try with explicit fallback parameter as third fallback
              const fallbackUrl = `${apiBaseUrl}/meetings/${meetingId}/audio?fallback=true&t=${Date.now()}`;
              console.log('Trying explicit fallback URL as third fallback:', fallbackUrl);
              
              try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                  { uri: fallbackUrl },
                  { shouldPlay: false },
                  onPlaybackStatusUpdate
                );
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
          
          // Check if the error is related to missing file (404) or connection issues
          const errorString = String(error);
          console.error('Audio loading error details:', errorString);
          
          if (errorString.includes('404') || 
              errorString.includes('not found') || 
              errorString.includes('NSURLErrorDomain')) {
            // For NSURLErrorDomain errors, provide more specific information
            if (errorString.includes('NSURLErrorDomain')) {
              console.log('NSURLErrorDomain error detected, trying fallback options');
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

  // Update playback status
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    
    if (!isSeeking) {
      setPosition(status.positionMillis || 0);
      setSliderValue(status.positionMillis || 0);
    }
    
    if (status.isLoaded && !totalDuration && status.durationMillis) {
      setTotalDuration(status.durationMillis);
    }
    
    setIsPlaying(status.isPlaying);
  };

  // Play/pause toggle with error handling
  const togglePlayback = async () => {
    if (!sound) {
      console.log('No sound object available');
      return;
    }
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        console.log('Audio paused successfully');
      } else {
        await sound.playAsync();
        console.log('Audio playing successfully');
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
  };

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

  // Manual retry with explicit fallback
  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setErrorMessage(null);
    setIsLoading(true);
    
    // Force using the fallback URL on manual retry
    if (meetingId) {
      // Use a high retry count to ensure fallback parameter is added
      const forcedFallbackUrl = meetingsApi.normalizeAudioUrl(undefined, meetingId, 999);
      console.log('Manual retry with forced fallback URL:', forcedFallbackUrl);
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
};

export default AudioPlayer;