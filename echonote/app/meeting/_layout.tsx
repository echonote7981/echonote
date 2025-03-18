import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MeetingLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C1C1E',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen
        name="[id]/index"
        options={{
          headerTitle: 'Recording Details',
          headerTitleStyle: {
            fontWeight: '600',
            color: '#FFFFFF',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <MaterialIcons name="arrow-back-ios" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
