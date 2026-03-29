import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { GoalService, Goal } from '../services/GoalService';
import { HABIT_CATEGORIES } from '../constants/HabitCategories';

const HomeScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const loadGoals = useCallback(async () => {
    const fetchedGoals = await GoalService.getGoals();
    setGoals(fetchedGoals);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const toggleGoal = async (id: string) => {
    const updated = await GoalService.toggleGoal(id);
    setGoals(updated);
  };

  const renderGoal = (item: Goal) => {
    const isCompletedToday = item.history && item.history.includes(new Date().toLocaleDateString('en-CA'));

    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
      >
        <View style={styles.goalInfo}>
          <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
            <Ionicons name={item.icon as any} size={24} color={theme.primary} />
          </View>
          <View style={{ opacity: isCompletedToday ? 0.5 : 1 }}>
            <Text style={[
              styles.goalName, 
              { color: theme.text, textDecorationLine: isCompletedToday ? 'line-through' : 'none' }
            ]}>
              {item.name}
            </Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={theme.warning} />
              <Text style={[styles.streakText, { color: theme.textSecondary }]}>{item.streak} dni pod rząd</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.checkbox, 
            { borderColor: theme.primary },
            isCompletedToday && { backgroundColor: theme.primary }
          ]} 
          onPress={() => toggleGoal(item.id)}
        >
          {isCompletedToday && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (cat: typeof HABIT_CATEGORIES[0]) => {
    const categoryGoals = goals.filter(g => g.category === cat.id);
    if (categoryGoals.length === 0) return null;

    return (
      <View key={cat.id} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Ionicons name={cat.icon as any} size={18} color={theme.primary} />
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{cat.name}</Text>
          <View style={[styles.categoryCount, { backgroundColor: theme.border }]}>
            <Text style={[styles.categoryCountText, { color: theme.textSecondary }]}>{categoryGoals.length}</Text>
          </View>
        </View>
        <View style={styles.categoryGoalsGrid}>
          {categoryGoals.map(renderGoal)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcome, { color: theme.textSecondary }]}>Cześć!</Text>
          <Text style={[styles.title, { color: theme.text }]}>Twoje Nawyki</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={80} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Brak nawyków</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Dodaj swój pierwszy nawyk, aby zacząć śledzić postępy!</Text>
          </View>
        ) : (
          HABIT_CATEGORIES.map(renderCategorySection)
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 12,
  },
  welcome: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginLeft: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryGoalsGrid: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
});

export default HomeScreen;
