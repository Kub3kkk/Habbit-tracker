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
import { HABIT_ICONS } from '../constants/HabitIcons';
import { HABIT_CATEGORIES } from '../constants/HabitCategories';

const AddGoalScreen = () => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [category, setCategory] = useState(HABIT_CATEGORIES[0].id);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const handleSave = async () => {
    if (name.trim()) {
      await GoalService.addGoal(
        name.trim(), 
        icon, 
        category,
        reminderEnabled ? reminderTime.toISOString() : null
      );
      navigation.goBack();
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Nowy Nawyk</Text>
        <TouchableOpacity onPress={handleSave} disabled={!name.trim()} style={styles.saveButton}>
          <Text style={[styles.saveText, { color: name.trim() ? theme.primary : theme.textSecondary }]}>Zapisz</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>NAZWA</Text>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            placeholder="np. Pij wodę"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>KATEGORIA</Text>
          <View style={styles.categoryGrid}>
            {HABIT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryOption,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  category === cat.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={20} 
                  color={category === cat.id ? '#FFFFFF' : theme.text} 
                />
                <Text style={[
                  styles.categoryText, 
                  { color: category === cat.id ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>IKONA</Text>
          <View style={styles.iconGrid}>
            {HABIT_ICONS.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                style={[
                  styles.iconOption,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  icon === iconName && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
              >
                <Ionicons 
                  name={iconName as any} 
                  size={24} 
                  color={icon === iconName ? '#FFFFFF' : theme.text} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.reminderContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelRow}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              <Text style={[styles.reminderLabel, { color: theme.text }]}>Przypomnienie</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {reminderEnabled && (
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  saveButton: {
    paddingHorizontal: 12,
  },
  saveText: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  section: {
    marginBottom: 32,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  reminderContainer: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddGoalScreen;
