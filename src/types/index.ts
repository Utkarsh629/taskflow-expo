// src/types/index.ts
// Core type definitions for the TodoApp

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskCategory = 'personal' | 'work' | 'health' | 'finance' | 'learning' | 'other';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;       // ISO date string
  deadline: string;        // ISO date string
  dateTime: string;        // ISO date string (scheduled time)
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  tags: string[];
  completedAt?: string;    // ISO date string when task was completed
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatarColor: string;     // Unique color for user avatar
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Add: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  EditTask: { taskId: string };
};

export type FilterType = 'all' | 'pending' | 'completed' | 'today' | 'overdue';
export type SortType = 'smart' | 'deadline' | 'priority' | 'created' | 'alphabetical';
