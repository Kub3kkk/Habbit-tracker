import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddGoalScreen from '../screens/AddGoalScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsSettingsScreen from '../screens/NotificationsSettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GoalDetailsScreen from '../screens/GoalDetailsScreen';

const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

const DashboardStackScreen = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={HomeScreen} />
      <DashboardStack.Screen name="GoalDetails" component={GoalDetailsScreen} />
    </DashboardStack.Navigator>
  );
};

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} />
      <SettingsStack.Screen name="GoalNotifications" component={NotificationsSettingsScreen} />
    </SettingsStack.Navigator>
  );
};

const RootNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 12),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 12,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Add" component={AddGoalScreen} options={{ tabBarLabel: 'New Habit' }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
};

export default RootNavigator;
