// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing } from '../utils/theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import TasksScreen from '../screens/main/TasksScreen';
import AddTaskScreen from '../screens/main/AddTaskScreen';
import StatsScreen from '../screens/main/StatsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon with emoji
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.bg },
      headerTitleStyle: {
        color: Colors.textPrimary,
        fontWeight: Typography.weightBold,
        fontSize: Typography.sizeLG,
        letterSpacing: 1,
      },
      headerTintColor: Colors.accent,
      tabBarStyle: {
        backgroundColor: Colors.bgCard,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 80,
        paddingBottom: 20,
        paddingTop: 8,
      },
      tabBarActiveTintColor: Colors.accent,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: {
        fontSize: Typography.sizeXS,
        fontWeight: Typography.weightMedium,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'TaskFlow',
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Tasks"
      component={TasksScreen}
      options={{
        title: 'My Tasks',
        tabBarLabel: 'Tasks',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Add"
      component={AddTaskScreen}
      options={{
        title: 'New Task',
        tabBarLabel: '',
        tabBarIcon: () => (
          <View style={addStyles.btn}>
            <Text style={addStyles.plus}>+</Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Stats"
      component={StatsScreen}
      options={{
        title: 'Statistics',
        tabBarLabel: 'Stats',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const addStyles = StyleSheet.create({
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  plus: { fontSize: 28, color: Colors.white, lineHeight: 32 },
});

// Loading splash shown while session is being read from storage
const LoadingScreen = () => (
  <View style={loadStyles.container}>
    <Text style={loadStyles.logo}>✦</Text>
    <Text style={loadStyles.appName}>TASKFLOW</Text>
    <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.lg }} />
  </View>
);

const loadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 48, color: Colors.accent, marginBottom: Spacing.sm },
  appName: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
});

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
