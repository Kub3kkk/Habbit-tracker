import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { NotificationService } from '../services/NotificationService';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    const enabled = await NotificationService.isGloballyEnabled();
    setNotificationsEnabled(enabled);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please enable notifications in your phone settings.');
        return;
      }
    }
    setNotificationsEnabled(value);
    await NotificationService.setGlobalEnabled(value);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Personalize your experience</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="moon-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.labelText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDark ? theme.text : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.labelText, { color: theme.text }]}>Global Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationsEnabled ? theme.text : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.row}
            onPress={() => navigation.navigate('GoalNotifications' as never)}
          >
            <View style={styles.rowLabel}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.labelText, { color: theme.text }]}>Habit Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLabel}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.labelText, { color: theme.text }]}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: theme.textSecondary }]}>Habbit Tracker v1.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    opacity: 0.6,
  },
});

export default SettingsScreen;
