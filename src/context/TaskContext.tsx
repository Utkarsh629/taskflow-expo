// src/context/TaskContext.tsx
// Manages all task operations with AsyncStorage persistence

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Priority, TaskCategory, TaskStatus, FilterType, SortType } from '../types';
import { useAuth } from './AuthContext';

const TASKS_STORAGE_KEY = '@todoapp_tasks';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getFilteredAndSorted: (filter: FilterType, sort: SortType, search?: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// ─── Smart Sort Algorithm ─────────────────────────────────────────────────────
// Combines deadline urgency, priority weight, and creation time for a balanced score
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const getSmartScore = (task: Task): number => {
  const now = Date.now();
  const deadline = new Date(task.deadline).getTime();
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

  // Urgency: inverse of hours remaining (clamped between 0-100)
  const urgencyScore = Math.max(0, Math.min(100, 100 - hoursUntilDeadline / 2.4));

  // Priority weight (0-100)
  const priorityScore = (PRIORITY_WEIGHTS[task.priority] / 4) * 100;

  // Age score: older tasks get slightly higher priority (0-20)
  const ageHours = (now - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
  const ageScore = Math.min(20, ageHours / 24);

  // Weighted combination: urgency 50%, priority 40%, age 10%
  return urgencyScore * 0.5 + priorityScore * 0.4 + ageScore * 0.1;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks whenever user changes
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setAllTasks([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const allStoredTasks: Task[] = data ? JSON.parse(data) : [];
      // Filter to only current user's tasks
      setAllTasks(allStoredTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get tasks for current user only
  const userTasks = allTasks.filter(t => t.userId === user?.id);

  const saveTasks = async (tasks: Task[]) => {
    // Merge user's updated tasks with other users' tasks
    const otherUsersTasks = allTasks.filter(t => t.userId !== user?.id);
    const merged = [...otherUsersTasks, ...tasks];
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(merged));
    setAllTasks(merged);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user!.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await saveTasks([...userTasks, newTask]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = userTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    await saveTasks(userTasks.filter(t => t.id !== id));
  };

  const toggleComplete = async (id: string) => {
    const task = userTasks.find(t => t.id === id);
    if (!task) return;

    const isCompleting = task.status !== 'completed';
    await updateTask(id, {
      status: isCompleting ? 'completed' : 'pending',
      completedAt: isCompleting ? new Date().toISOString() : undefined,
    });
  };

  const getFilteredAndSorted = (filter: FilterType, sort: SortType, search = ''): Task[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // ── Filter ──────────────────────────────────────
    let filtered = userTasks.filter(task => {
      if (search) {
        const q = search.toLowerCase();
        if (!task.title.toLowerCase().includes(q) &&
            !task.description.toLowerCase().includes(q) &&
            !task.tags.some(tag => tag.toLowerCase().includes(q))) {
          return false;
        }
      }

      switch (filter) {
        case 'completed':
          return task.status === 'completed';
        case 'pending':
          return task.status !== 'completed';
        case 'today': {
          const taskDate = new Date(task.deadline);
          return taskDate >= today && taskDate < tomorrow;
        }
        case 'overdue': {
          return task.status !== 'completed' && new Date(task.deadline) < now;
        }
        default:
          return true;
      }
    });

    // ── Sort ─────────────────────────────────────────
    switch (sort) {
      case 'smart':
        filtered.sort((a, b) => getSmartScore(b) - getSmartScore(a));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case 'priority':
        filtered.sort((a, b) => PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]);
        break;
      case 'created':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  };

  return (
    <TaskContext.Provider value={{
      tasks: userTasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
      getFilteredAndSorted,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
