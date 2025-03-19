import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import audioStyles from '../styles/audioPlayer';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
}

const formatTime = (milliseconds: number): string => {
  if (!milliseconds) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, duration = 0 }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration * 1000);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Load sound on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadSound = async () => {
      try {
        setIsLoading(true);
        
        // Unload any existing sound
        if (sound) {
          await sound.unloadAsync();
        }
        
        console.log('Loading audio from URL:', audioUrl);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        
        if (isMounted) {
          setSound(newSound);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };
    
    if (audioUrl) {
      loadSound();
    }
    
    return () => {
      isMounted = false;
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl]);

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

  // Play/pause toggle
  const togglePlayback = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
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

  return (
    <View style={audioStyles.container}>
      {isLoading ? (
        <View style={audioStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#0A84FF" />
          <Text style={audioStyles.loadingText}>Loading audio...</Text>
        </View>
      ) : (
        <>
          <View style={audioStyles.timeContainer}>
            <Text style={audioStyles.timeText}>{formatTime(position)}</Text>
            <Text style={audioStyles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
          
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
            <TouchableOpacity style={audioStyles.controlButton} onPress={rewind}>
              <MaterialIcons name="replay-10" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={audioStyles.playButton} onPress={togglePlayback}>
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={36}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={audioStyles.controlButton} onPress={forward}>
              <MaterialIcons name="forward-10" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default AudioPlayer;