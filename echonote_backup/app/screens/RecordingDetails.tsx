import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles';

export default function RecordingDetails({ route }:
    { route: { params: { transcript: string; audioUri: string; meeting?: any } } }) {
  const { transcript, audioUri, meeting } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playAudio() {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else if (audioUri) {
        console.log('Loading sound', audioUri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async function pauseAudio() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  function onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  }
  
  // Format time for display (mm:ss)
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Transcript</Text>
      <ScrollView style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>{transcript || 'No transcript available.'}</Text>
      </ScrollView>

      {/* Audio Player below transcript */}
      {audioUri && (
        <View style={styles.audioPlayerContainer}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={isPlaying ? pauseAudio : playAudio}
          >
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <View style={styles.audioInfoContainer}>
            <Text style={styles.audioText}>
              {isPlaying ? "Pause Recording" : "Play Recording"}
            </Text>
            {duration > 0 && (
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Match your app's dark theme
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: '#121212', // Slightly lighter than background
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  transcriptText: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 24,
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#BB86FC', // Primary color
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioInfoContainer: {
    flex: 1,
  },
  audioText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
});
