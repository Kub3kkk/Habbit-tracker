import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { GoalService, Goal } from '../services/GoalService';
import ContributionGrid from '../components/ContributionGrid';

const HomeScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    if (!refreshing) setLoading(true);
    const storedGoals = await GoalService.getGoals();
    setGoals(sortGoals(storedGoals));
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const sortGoals = (unsorted: Goal[]) => {
    return [...unsorted].sort((a, b) => {
      const aDone = isCompletedToday(a);
      const bDone = isCompletedToday(b);
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return b.id.localeCompare(a.id);
    });
  };

  const handleDeleteGoal = (id: string, name: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure? All progress for "${name}" will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const updated = await GoalService.deleteGoal(id);
            setGoals(sortGoals(updated));
          }
        },
      ]
    );
  };

  const handleToggleGoal = async (id: string) => {
    const updated = await GoalService.toggleGoal(id);
    setGoals(sortGoals(updated));
  };

  const isCompletedToday = (goal: Goal) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    return goal.history?.includes(todayStr) || false;
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const completed = isCompletedToday(item);
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.habitCard, { backgroundColor: theme.surface, borderColor: theme.border }, completed && styles.habitCardCompleted]}
        onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
        onLongPress={() => handleDeleteGoal(item.id, item.name)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
            <Ionicons name={item.icon as any} size={24} color={completed ? theme.textSecondary : theme.primary} />
          </View>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, { color: theme.text }, completed && { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
              {item.name}
            </Text>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={16} color={theme.warning} />
              <Text style={[styles.habitStreak, { color: theme.warning }]}>{item.streak} day streak</Text>
            </View>
          </View>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => handleToggleGoal(item.id)}
            style={[styles.checkbox, { borderColor: theme.border, backgroundColor: theme.background }, completed && { backgroundColor: theme.success, borderColor: theme.success }]}
          >
            {completed && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={[styles.gridSection, { borderTopColor: theme.border }]}>
          <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Last 4 weeks persistence:</Text>
          <ContributionGrid history={item.history || []} daysToDisplay={28} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your progress at a glance</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoal}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Empty dashboard. Time to start a habit!</Text>
            </View>
          }
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
    paddingTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  habitCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  habitCardCompleted: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitStreak: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  gridLabel: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
