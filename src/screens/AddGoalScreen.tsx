import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { GoalService } from '../services/GoalService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AddGoalScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    
    // Pass reminder as ISO string if enabled
    const finalReminder = showReminder ? reminderTime.toISOString() : null;
    await GoalService.addGoal(name.trim(), finalReminder);
    
    setName('');
    setShowReminder(false);
    setLoading(false);
    navigation.navigate('Dashboard');
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Hide picker for Android, keep for iOS (inline)
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>New Habit</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Define your next achievement</Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>What do you want to achieve?</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g., Read for 30 min"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={[styles.reminderControl, { borderTopColor: theme.border }]}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitle}>
                <Ionicons name="notifications-outline" size={20} color={theme.text} />
                <Text style={[styles.reminderLabel, { color: theme.text }]}>Daily Reminder</Text>
              </View>
              <Switch
                value={showReminder}
                onValueChange={setShowReminder}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            {showReminder && (
              <TouchableOpacity 
                style={[styles.timePickerBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time-outline" size={20} color={theme.primary} />
              </TouchableOpacity>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }, !name.trim() && styles.buttonDisabled]} 
          onPress={handleCreate}
          disabled={!name.trim() || loading}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {loading ? 'Creating...' : 'Launch Habit'}
          </Text>
          <Ionicons name="rocket-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  reminderControl: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginTop: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddGoalScreen;
