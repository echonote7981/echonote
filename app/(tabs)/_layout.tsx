import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import HamburgerMenu from '../components/HamburgerMenu';
import theme from '../styles/theme';

export default function TabLayout() {
  const styles = StyleSheet.create({
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    }
  });
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#fff',
        headerLeft: () => <HamburgerMenu />,
        headerTitle: () => <Text style={styles.headerTitle}>EchoNotes</Text>,
        headerRight: () => <View style={{ width: 40 }} />,
      }}>
      {/* Settings moved to hamburger menu */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => <MaterialIcons name="mic" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color }) => <MaterialIcons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: 'Actions',
          tabBarIcon: ({ color }) => <MaterialIcons name="check-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="archived"
        options={{
          title: 'Archives',
          tabBarIcon: ({ color }) => <MaterialIcons name="archive" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={24} color={color} />,
        }}
      />
      {/* Hide settings from tab bar */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // This hides the tab from navigation
        }}
      />
      {/* Hide upgrade from tab bar */}
      <Tabs.Screen
        name="upgrade"
        options={{
          href: null, // This hides the tab from navigation
        }}
      />
    </Tabs>
  );
}
