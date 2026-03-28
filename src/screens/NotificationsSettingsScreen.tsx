import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Switch, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { GoalService, Goal } from '../services/GoalService';
import { NotificationService } from '../services/NotificationService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationsSettingsScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  const { theme } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const stored = await GoalService.getGoals();
    setGoals(stored);
  };

  const handleToggleReminder = async (goal: Goal, enabled: boolean) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        return { ...g, reminderTime: enabled ? new Date().toISOString() : null };
      }
      return g;
    });
    
    setGoals(updatedGoals);
    await GoalService.saveGoals(updatedGoals);

    if (enabled) {
      // Automatically open picker if enabling
      setEditingGoal(goal);
      setTempTime(new Date());
      setShowTimePicker(true);
    } else {
      await NotificationService.cancelGoalReminder(goal.id);
    }
  };

  const onTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Hide picker for Android
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }

    if (selectedDate && editingGoal) {
      const updatedGoals = goals.map(g => {
        if (g.id === editingGoal.id) {
          return { ...g, reminderTime: selectedDate.toISOString() };
        }
        return g;
      });
      setGoals(updatedGoals);
      await GoalService.saveGoals(updatedGoals);
      await NotificationService.scheduleGoalReminder(editingGoal.id, editingGoal.name, selectedDate);
      setEditingGoal(null);
    }
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const hasReminder = !!item.reminderTime;
    const reminderDate = item.reminderTime ? new Date(item.reminderTime) : null;

    return (
      <View style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalName, { color: theme.text }]}>{item.name}</Text>
          {hasReminder && (
            <TouchableOpacity 
              onPress={() => {
                setEditingGoal(item);
                setTempTime(reminderDate || new Date());
                setShowTimePicker(true);
              }}
            >
              <Text style={[styles.reminderTimeText, { color: theme.primary }]}>
                {reminderDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Switch
          value={hasReminder}
          onValueChange={(val) => handleToggleReminder(item, val)}
          trackColor={{ false: theme.border, true: theme.primary }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Habit Reminders</Text>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>No habits created yet.</Text>
        }
      />

      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    gap: 4,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderTimeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});

export default NotificationsSettingsScreen;
