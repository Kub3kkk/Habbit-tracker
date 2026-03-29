import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './NotificationService';
import { DEFAULT_CATEGORY } from '../constants/HabitCategories';

export interface Goal {
  id: string;
  name: string;
  icon: string;
  category: string;
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
        let updated = { ...goal };
        if (!updated.history) { updated.history = []; hasChanges = true; }
        if (!updated.icon) { updated.icon = 'star'; hasChanges = true; }
        if (!updated.category) { updated.category = DEFAULT_CATEGORY; hasChanges = true; }

        if (!updated.completedAt || updated.streak === 0) return updated;

        const lastDateStr = new Date(updated.completedAt).toLocaleDateString('en-CA');
        
        if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
          hasChanges = true;
          return { ...updated, streak: 0 };
        }
        return updated;
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

  addGoal: async (name: string, icon: string = 'star', category: string = DEFAULT_CATEGORY, reminderTime: string | null = null): Promise<Goal> => {
    const goals = await GoalService.getGoals();
    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      icon,
      category,
      streak: 0,
      completedAt: null,
      history: [],
      reminderTime,
    };

    await GoalService.saveGoals([...goals, newGoal]);
    
    // If reminderTime is set, schedule notification (non-blocking)
    if (reminderTime) {
      NotificationService.scheduleGoalReminder(newGoal.id, newGoal.name, new Date(reminderTime))
        .catch(err => console.error('Background notification error:', err));
    }

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
  updateGoal: async (id: string, updates: Partial<Pick<Goal, 'name' | 'icon' | 'category'>>) => {
    const goals = await GoalService.getGoals();
    let updatedGoal: Goal | undefined;

    const updated = goals.map(g => {
      if (g.id === id) {
        updatedGoal = { ...g, ...updates };
        return updatedGoal;
      }
      return g;
    });

    if (updatedGoal && updates.name && updatedGoal.reminderTime) {
      NotificationService.cancelGoalReminder(id);
      NotificationService.scheduleGoalReminder(id, updates.name, new Date(updatedGoal.reminderTime))
        .catch(err => console.error('Background notification error:', err));
    }

    await GoalService.saveGoals(updated);
    return updated;
  },
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
