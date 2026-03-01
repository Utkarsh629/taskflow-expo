// src/screens/main/HomeScreen.tsx
// Dashboard showing task overview, stats, and quick actions

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Colors, Typography, Spacing, Radius, Shadow, getPriorityColor, getCategoryColor, getCategoryIcon } from '../../utils/theme';
import { getRelativeTime, isOverdue, isDueToday } from '../../utils/dateHelpers';
import { Task } from '../../types';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const navigation = useNavigation<any>();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => isOverdue(t.deadline, t.status)).length;
    const today = tasks.filter(t => isDueToday(t.deadline) && t.status !== 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, today, completionRate };
  }, [tasks]);

  // Get top 3 urgent tasks for "Focus" section
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [tasks]);

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greetingTime()},</Text>
          <Text style={styles.userName}>{firstName} 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: user?.avatarColor || Colors.accent }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>{user?.name[0]?.toUpperCase() || '?'}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercent}>{stats.completionRate}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats.completionRate}%` as any }]} />
        </View>
        <Text style={styles.progressSub}>
          {stats.completed} of {stats.total} tasks completed
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard label="Total" value={stats.total} color={Colors.accent} icon="📋" />
        <StatCard label="Done" value={stats.completed} color={Colors.success} icon="✅" />
        <StatCard label="Today" value={stats.today} color={Colors.warning} icon="📅" />
        <StatCard label="Overdue" value={stats.overdue} color={Colors.danger} icon="⚠️" />
      </View>

      {/* Quick Action */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Add')}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>ADD NEW TASK</Text>
      </TouchableOpacity>

      {/* Focus Section */}
      {urgentTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Focus Now</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.sectionLink}>See all →</Text>
            </TouchableOpacity>
          </View>
          {urgentTasks.map(task => (
            <FocusTaskCard key={task.id} task={task} onPress={() => navigation.navigate('Tasks')} />
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 By Category</Text>
          <CategoryBreakdown tasks={tasks} />
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: string;
}) => (
  <View style={[statStyles.card, { borderTopColor: color }]}>
    <Text style={statStyles.icon}>{icon}</Text>
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: Spacing.xs / 2,
    ...Shadow.card,
  },
  icon: { fontSize: 20, marginBottom: Spacing.xs },
  value: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.sizeXS,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});

const FocusTaskCard = ({ task, onPress }: { task: Task; onPress: () => void }) => {
  const overdue = isOverdue(task.deadline, task.status);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <TouchableOpacity style={focusStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[focusStyles.priorityBar, { backgroundColor: priorityColor }]} />
      <View style={focusStyles.content}>
        <Text style={focusStyles.title} numberOfLines={1}>{task.title}</Text>
        <Text style={[focusStyles.due, overdue && focusStyles.dueOverdue]}>
          {overdue ? '🔴 ' : '🕐 '}{getRelativeTime(task.deadline)}
        </Text>
      </View>
      <View style={[focusStyles.badge, { backgroundColor: priorityColor + '22' }]}>
        <Text style={[focusStyles.badgeText, { color: priorityColor }]}>
          {task.priority.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const focusStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  content: { flex: 1, padding: Spacing.md },
  title: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  due: { fontSize: Typography.sizeSM, color: Colors.textSecondary },
  dueOverdue: { color: Colors.danger },
  badge: {
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  badgeText: { fontSize: Typography.sizeXS, fontWeight: Typography.weightBold },
});

const CategoryBreakdown = ({ tasks }: { tasks: Task[] }) => {
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const max = Math.max(...categories.map(([, v]) => v));

  return (
    <View style={catStyles.container}>
      {categories.map(([cat, count]) => (
        <View key={cat} style={catStyles.row}>
          <Text style={catStyles.icon}>{getCategoryIcon(cat)}</Text>
          <Text style={catStyles.label}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          <View style={catStyles.barContainer}>
            <View
              style={[
                catStyles.bar,
                {
                  width: `${(count / max) * 100}%` as any,
                  backgroundColor: getCategoryColor(cat),
                },
              ]}
            />
          </View>
          <Text style={catStyles.count}>{count}</Text>
        </View>
      ))}
    </View>
  );
};

const catStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  icon: { fontSize: 16, width: 20 },
  label: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    width: 70,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.round,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: Radius.round },
  count: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: Typography.size3XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: Typography.sizeSM,
    color: Colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.sizeLG,
    fontWeight: Typography.weightBold,
    color: Colors.white,
  },
  progressCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
  },
  progressPercent: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    color: Colors.accent,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.round,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.round,
  },
  progressSub: {
    fontSize: Typography.sizeSM,
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs / 2,
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.button,
  },
  addButtonIcon: {
    fontSize: Typography.size2XL,
    color: Colors.white,
    fontWeight: Typography.weightLight,
    lineHeight: 28,
  },
  addButtonText: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightBold,
    color: Colors.white,
    letterSpacing: 2,
  },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizeLG,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionLink: {
    fontSize: Typography.sizeSM,
    color: Colors.accent,
    fontWeight: Typography.weightMedium,
  },
});

export default HomeScreen;
