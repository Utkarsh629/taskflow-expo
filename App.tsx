// App.tsx — Expo entry point
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Expo's StatusBar — 'light' makes text/icons white on dark background */}
      <StatusBar style="light" backgroundColor="#0A0A0F" />
      <AuthProvider>
        <TaskProvider>
          <AppNavigator />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
