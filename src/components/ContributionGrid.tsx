import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ContributionGridProps {
  history: string[]; // dates like "YYYY-MM-DD"
  daysToDisplay?: number;
}

const ContributionGrid: React.FC<ContributionGridProps> = ({ history, daysToDisplay = 28 }) => {
  const { theme } = useTheme();
  const dates = [];
  const today = new Date();

  // Create an array of strings representing the last N days
  for (let i = daysToDisplay - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toLocaleDateString('en-CA'));
  }

  return (
    <View style={styles.grid}>
      {dates.map((dateStr, index) => {
        const isCompleted = history.includes(dateStr);
        return (
          <View 
            key={index} 
            style={[
              styles.square, 
              { backgroundColor: theme.background, borderColor: theme.border },
              isCompleted && { backgroundColor: theme.success, borderColor: theme.success }
            ]} 
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
});

export default ContributionGrid;
