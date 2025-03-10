import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StyleSheet, LogBox } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from './src/types';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  // Add any other warnings you want to ignore
]);

/**
 * Main app component
 * Wraps the app with necessary providers and sets up global styles
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <HomeScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
}); 