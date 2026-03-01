// src/context/AuthContext.tsx
// Manages user authentication state with AsyncStorage persistence

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const STORAGE_KEYS = {
  USERS: '@todoapp_users',
  CURRENT_USER: '@todoapp_current_user',
};

// Generate a random avatar color for new users
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal type to store hashed passwords
interface StoredUser extends User {
  passwordHash: string;
}

// Simple hash function (in production, use bcrypt or similar)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredUsers = async (): Promise<StoredUser[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  };

  const saveStoredUsers = async (users: StoredUser[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const users = await getStoredUsers();

      // Check if email already exists
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Validate inputs
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      // Create new user
      const newUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        passwordHash: simpleHash(password),
      };

      users.push(newUser);
      await saveStoredUsers(users);

      // Auto-login after registration
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const users = await getStoredUsers();
      const found = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() &&
             u.passwordHash === simpleHash(password)
      );

      if (!found) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const { passwordHash: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
