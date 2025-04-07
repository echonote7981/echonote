import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Action } from '../../services/api';
import { actionsApi } from '../../services/api';
import { meetingDetailsStyles as styles } from '../../styles/common';
import LoadingScreen from '../../components/LoadingScreen';

const getPriorityStyle = (priority: Action['priority']) => {
  switch (priority) {
    case 'High':
      return styles.high;
    case 'Medium':
      return styles.medium;
    case 'Low':
      return styles.low;
    default:
      return {};
  }
};

const getStatusStyle = (status: Action['status']) => {
  switch (status) {
    case 'pending':
      return styles.pending;
    case 'completed':
      return styles.completed;
    default:
      return {};
  }
};

export default function ActionsPage() {
  const { id } = useLocalSearchParams();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActions = async () => {
      try {
        const data = await actionsApi.getByMeeting(id as string);
        setActions(data);
      } catch (error) {
        console.error('Failed to load actions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActions();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (actions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No action items found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Action Items',
          headerBackTitle: 'Back',
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {actions.map((action, index) => (
          <View key={action.id || index} style={styles.actionItem}>
            <Text style={styles.actionTitle}>
              • {action.title}
            </Text>
            {action.dueDate && (
              <Text style={styles.actionDetail}>
                Due: {new Date(action.dueDate).toLocaleDateString()}
              </Text>
            )}
            <Text style={[styles.actionDetail, getPriorityStyle(action.priority)]}>
              Priority: {action.priority}
            </Text>
            <Text style={[styles.actionDetail, getStatusStyle(action.status)]}>
              Status: {action.status}
            </Text>
            {action.notes && (
              <Text style={styles.actionNotes}>{action.notes}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </>
  );
}
