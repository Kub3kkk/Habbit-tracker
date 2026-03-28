import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  name: string;
  streak: number;
  completedAt: string | null;
  history: string[]; // List of unique date strings "YYYY-MM-DD"
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
        // Ensure history array exists
        if (!goal.history) goal.history = [];
        
        // Validation: if last completed was before yesterday, reset streak
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

  addGoal: async (name: string): Promise<Goal> => {
    const goals = await GoalService.getGoals();
    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      streak: 0,
      completedAt: null,
      history: [],
    };
    await GoalService.saveGoals([...goals, newGoal]);
    return newGoal;
  },

  deleteGoal: async (id: string) => {
    const goals = await GoalService.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    await GoalService.saveGoals(filtered);
    return filtered;
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
          // Untoggle today
          newHistory = newHistory.filter(d => d !== todayStr);
          newStreak = Math.max(0, newStreak - 1);
          // Set completedAt to previous completion or null
          newCompletedAt = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
        } else {
          // Toggle today
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
