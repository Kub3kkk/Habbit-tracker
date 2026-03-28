import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './NotificationService';

export interface Goal {
  id: string;
  name: string;
  streak: number;
  completedAt: string | null;
  history: string[]; // List of unique date strings "YYYY-MM-DD"
  reminderTime: string | null; // ISO Date of the set reminder time or null
}

const STORAGE_KEY = '@habbit_tracker_goals';

export const GoalService = {
  getGoals: async (): Promise<Goal[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const goals: Goal[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      let hasChanges = false;
      const validatedGoals = goals.map(goal => {
        if (!goal.history) goal.history = [];
        if (!goal.completedAt || goal.streak === 0) return goal;

        const lastDateStr = new Date(goal.completedAt).toLocaleDateString('en-CA');
        
        if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
          hasChanges = true;
          return { ...goal, streak: 0 };
        }
        return goal;
      });

      if (hasChanges) {
        await GoalService.saveGoals(validatedGoals);
      }
      
      return validatedGoals;
    } catch (e) {
      console.error('Error fetching goals:', e);
      return [];
    }
  },

  saveGoals: async (goals: Goal[]) => {
    try {
      const jsonValue = JSON.stringify(goals);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  },

  addGoal: async (name: string, reminderTime: string | null = null): Promise<Goal> => {
    const goals = await GoalService.getGoals();
    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      streak: 0,
      completedAt: null,
      history: [],
      reminderTime,
    };

    // If reminderTime is set, schedule notification
    if (reminderTime) {
      await NotificationService.scheduleGoalReminder(newGoal.id, newGoal.name, new Date(reminderTime));
    }

    await GoalService.saveGoals([...goals, newGoal]);
    return newGoal;
  },

  deleteGoal: async (id: string) => {
    const goals = await GoalService.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    
    // Cancel notification
    await NotificationService.cancelGoalReminder(id);

    await GoalService.saveGoals(filtered);
    return filtered;
  },
// ... toggleGoal implementation is unchanged for now or I can update it to be cleaner
  toggleGoal: async (id: string) => {
    const goals = await GoalService.getGoals();
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    const updated = goals.map(g => {
      if (g.id === id) {
        const history = g.history || [];
        const isCurrentlyCompleted = history.includes(todayStr);
        
        let newHistory = [...history];
        let newStreak = g.streak;
        let newCompletedAt = g.completedAt;

        if (isCurrentlyCompleted) {
          newHistory = newHistory.filter(d => d !== todayStr);
          newStreak = Math.max(0, newStreak - 1);
          newCompletedAt = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
        } else {
          newHistory.push(todayStr);
          newStreak = newStreak + 1;
          newCompletedAt = todayStr;
        }

        return {
          ...g,
          streak: newStreak,
          completedAt: newCompletedAt,
          history: newHistory,
        };
      }
      return g;
    });
    
    await GoalService.saveGoals(updated);
    return updated;
  }
};
