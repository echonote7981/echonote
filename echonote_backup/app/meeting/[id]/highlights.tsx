import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Meeting } from '../../services/api';
import { meetingsApi } from '../../services/api';
import { meetingDetailsStyles as styles } from '../../styles/common';
import LoadingScreen from '../../components/LoadingScreen';

export default function HighlightsPage() {
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
  if (!meeting || !meeting.highlights || meeting.highlights.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No highlights found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Highlights',
          headerBackTitle: 'Back',
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {meeting.highlights.map((highlight, index) => (
          <Text key={index} style={styles.listItem}>
            • {highlight}
          </Text>
        ))}
      </ScrollView>
    </>
  );
}
