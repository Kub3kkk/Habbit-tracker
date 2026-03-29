import * as Notifications from 'expo-notifications';
// Try directly importing if index resolution fails in SDK 54 + Expo Go
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const GLOBAL_NOTIF_KEY = '@habbit_tracker_notifications_enabled';

export const NotificationService = {
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  isGloballyEnabled: async () => {
    const value = await AsyncStorage.getItem(GLOBAL_NOTIF_KEY);
    return value !== 'false'; // Enabled by default
  },

  setGlobalEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(GLOBAL_NOTIF_KEY, enabled.toString());
    if (!enabled) {
      // Cancel all if disabling globally
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  },

  scheduleGoalReminder: async (goalId: string, name: string, time: Date) => {
    try {
      const isEnabled = await NotificationService.isGloballyEnabled();
      if (!isEnabled) return null;

      // Request permissions
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      // Cancel existing for this goal if any
      await NotificationService.cancelGoalReminder(goalId);

      // Structure for a daily recurring notification at a specific time
      const trigger = {
        type: 'daily' as any,
        hour: time.getHours(),
        minute: time.getMinutes(),
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Przypomnienie o nawyku 🚀",
          body: `Czas na: "${name}"! Jak Ci dzisiaj idzie?`,
          data: { goalId },
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      // We return null but don't throw, so the habit creation can continue
      return null;
    }
  },

  cancelGoalReminder: async (goalId: string) => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter(n => n.content.data?.goalId === goalId);
      for (const n of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }
};
