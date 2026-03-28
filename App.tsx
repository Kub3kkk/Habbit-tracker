import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme/Colors';

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: Colors.background }}>
      <NavigationContainer>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
