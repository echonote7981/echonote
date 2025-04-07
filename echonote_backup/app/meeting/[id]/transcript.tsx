import { View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Meeting } from '../../services/api';
import { meetingsApi } from '../../services/api';
import TranscriptText from '../../components/TranscriptText';
import { meetingDetailsStyles as styles } from '../../styles/common';
import LoadingScreen from '../../components/LoadingScreen';

export default function TranscriptPage() {
  const { id } = useLocalSearchParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const data = await meetingsApi.getById(id as string);
        setMeeting(data);
      } catch (error) {
        console.error('Failed to load meeting:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!meeting || !meeting.transcript) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transcript not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Transcript',
          headerBackTitle: 'Back',
        }} 
      />
      <View style={[styles.container, styles.contentContainer]}>
        <TranscriptText text={meeting.transcript} />
      </View>
    </>
  );
}
