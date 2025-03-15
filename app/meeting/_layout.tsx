import { Stack, useRouter, Tabs } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MeetingLayout() {
  const router = useRouter();

  return (
    <>
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
      
      {/* Custom tab bar at the bottom */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,  // Increased from 10 to 15
        paddingBottom: 20,    // Extra padding at the bottom
        borderTopWidth: 1,
        borderTopColor: '#555555', // Lighter border for better contrast
        shadowColor: '#000',       // Add shadow for better visibility
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,               // For Android shadow
      }}>
        <TouchableOpacity 
          style={{ alignItems: 'center', paddingHorizontal: 12 }}
          onPress={() => router.push('/')}
        >
          <MaterialIcons name="mic" size={26} color="#CCCCCC" />
          <View style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ alignItems: 'center', paddingHorizontal: 12 }}
          onPress={() => router.push('/meetings')}
        >
          <MaterialIcons name="list" size={26} color="#CCCCCC" />
          <View style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ alignItems: 'center', paddingHorizontal: 12 }}
          onPress={() => router.push('/calendar')}
        >
          <MaterialIcons name="calendar-today" size={26} color="#CCCCCC" />
          <View style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ alignItems: 'center', paddingHorizontal: 12 }}
          onPress={() => router.push('/actions')}
        >
          <MaterialIcons name="check-circle" size={26} color="#CCCCCC" />
          <View style={{ marginTop: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ alignItems: 'center', paddingHorizontal: 12 }}
          onPress={() => router.push('/archived')}
        >
          <MaterialIcons name="archive" size={26} color="#CCCCCC" />
          <View style={{ marginTop: 4 }} />
        </TouchableOpacity>
      </View>
    </>
  );
}
