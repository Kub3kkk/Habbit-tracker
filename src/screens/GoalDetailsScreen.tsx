import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { GoalService, Goal } from '../services/GoalService';
import ContributionGrid from '../components/ContributionGrid';
import { HABIT_ICONS } from '../constants/HabitIcons';
import { HABIT_CATEGORIES } from '../constants/HabitCategories';

const { width } = Dimensions.get('window');

const GoalDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { goalId } = route.params;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const loadGoalDetails = useCallback(async () => {
    const goals = await GoalService.getGoals();
    const found = goals.find(g => g.id === goalId);
    if (found) {
      setGoal(found);
      setEditName(found.name);
      setEditIcon(found.icon);
      setEditCategory(found.category || 'other');
    }
    setLoading(false);
  }, [goalId]);

  useFocusEffect(
    useCallback(() => {
      loadGoalDetails();
    }, [loadGoalDetails])
  );

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    await GoalService.updateGoal(goalId, { 
      name: editName.trim(), 
      icon: editIcon,
      category: editCategory
    });
    setIsEditModalVisible(false);
    loadGoalDetails();
  };

  const handleDelete = () => {
    Alert.alert(
      "Usuń nawyk",
      "Czy na pewno chcesz bezpowrotnie usunąć ten nawyk?",
      [
        { text: "Anuluj", style: "cancel" },
        { 
          text: "Usuń", 
          style: "destructive",
          onPress: async () => {
            await GoalService.deleteGoal(goalId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (!goal || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  // Calculate some stats
  const totalCompleted = goal.history.length;
  const bestStreak = calculateBestStreak(goal.history);
  const completionRate = calculateCompletionRate(goal.history);

  const currentCategory = HABIT_CATEGORIES.find(c => c.id === goal.category) || HABIT_CATEGORIES[HABIT_CATEGORIES.length - 1];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>Szczegóły Nawyku</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
            <Ionicons name={goal.icon as any} size={40} color={theme.primary} />
          </View>
          <Text style={[styles.habitName, { color: theme.text }]}>{goal.name}</Text>
          
          <View style={[styles.categoryBadge, { backgroundColor: theme.background }]}>
            <Ionicons name={currentCategory.icon as any} size={14} color={theme.primary} />
            <Text style={[styles.categoryBadgeText, { color: theme.textSecondary }]}>{currentCategory.name}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statSquare}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{goal.streak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>AKTUALNY</Text>
            </View>
            <View style={styles.statSquare}>
              <Text style={[styles.statValue, { color: theme.warning }]}>{bestStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>NAJLEPSZY</Text>
            </View>
            <View style={styles.statSquare}>
              <Text style={[styles.statValue, { color: theme.success }]}>{totalCompleted}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>SUMA</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Podgląd postępu</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>MAPA WYTRWAŁOŚCI</Text>
            <ContributionGrid history={goal.history} daysToDisplay={98} />
            <Text style={[styles.completionText, { color: theme.textSecondary }]}>
              Skuteczność: <Text style={{ color: theme.text }}>{completionRate}%</Text> w ostatnich 3 miesiącach
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Akcje</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
               style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1 }]}
               onPress={() => setIsEditModalVisible(true)}
            >
              <Ionicons name="pencil-outline" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Edytuj</Text>
            </TouchableOpacity>

            <TouchableOpacity 
               style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.error || '#FF4444', flex: 1 }]}
               onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={theme.error || '#FF4444'} />
              <Text style={[styles.actionText, { color: theme.text }]}>Usuń</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edytuj Nawyk</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>NAZWA</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nazwa nawyku"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>KATEGORIA</Text>
              <View style={styles.categoryGrid}>
                {HABIT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setEditCategory(cat.id)}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      editCategory === cat.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={18} 
                      color={editCategory === cat.id ? '#FFFFFF' : theme.text} 
                    />
                    <Text style={[
                      styles.categoryText, 
                      { color: editCategory === cat.id ? '#FFFFFF' : theme.textSecondary }
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>IKONA</Text>
              <View style={styles.iconGrid}>
                {HABIT_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setEditIcon(icon)}
                    style={[
                      styles.iconOption,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      editIcon === icon && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={24} 
                      color={editIcon === icon ? '#FFFFFF' : theme.text} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleUpdate}
              >
                <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// --- Helpers ---
const calculateBestStreak = (history: string[]) => {
  if (history.length === 0) return 0;
  
  const sortedHistory = [...history].sort();
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (let i = 0; i < sortedHistory.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(sortedHistory[i - 1]);
      const currDate = new Date(sortedHistory[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
  }
  
  return maxStreak;
};

const calculateCompletionRate = (history: string[]) => {
  if (history.length === 0) return 0;
  const days = 90; // Last 3 months approx
  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() - days);
  
  const hitsInWindow = history.filter(d => new Date(d) >= cutoff).length;
  return Math.round((hitsInWindow / days) * 100);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
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
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  mainCard: {
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statSquare: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  completionText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default GoalDetailsScreen;
