import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { GoalService } from '../services/GoalService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AddGoalScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await GoalService.addGoal(name.trim());
    setName('');
    setLoading(false);
    navigation.navigate('Dashboard');
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

          <View style={styles.tips}>
            <View style={styles.tipRow}>
              <Ionicons name="flash-outline" size={20} color={theme.primary} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>Start small and stay consistent.</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>Set a specific time each day.</Text>
            </View>
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
  tips: {
    gap: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
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
