import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_HABITS = [
  { id: '1', name: 'Drink Water', streak: 5, status: 'completed' },
  { id: '2', name: 'Evening Meditation', streak: 3, status: 'pending' },
  { id: '3', name: 'Work Out', streak: 0, status: 'pending' },
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Goals</Text>
        <TouchableOpacity style={styles.plusButton}>
          <Ionicons name="add" size={32} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_HABITS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitStreak}>Streak: {item.streak} days</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.checkbox, 
                item.status === 'completed' && styles.checkboxCompleted
              ]}
            >
              {item.status === 'completed' && (
                <Ionicons name="checkmark" size={20} color={Colors.text} />
              )}
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  plusButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 8,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  habitCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
});

export default HomeScreen;
