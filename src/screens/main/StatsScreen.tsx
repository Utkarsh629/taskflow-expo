// src/screens/main/StatsScreen.tsx
// Analytics and productivity statistics

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTasks } from '../../context/TaskContext';
import {
  Colors, Typography, Spacing, Radius, Shadow,
  getPriorityColor, getCategoryColor, getCategoryIcon,
} from '../../utils/theme';
import { isOverdue } from '../../utils/dateHelpers';
import { Priority, TaskCategory } from '../../types';

const StatsScreen = () => {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => isOverdue(t.deadline, t.status)).length;
    const pending = tasks.filter(t => t.status !== 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // By Priority
    const byPriority: Record<Priority, { total: number; completed: number }> = {
      critical: { total: 0, completed: 0 },
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 },
    };
    tasks.forEach(t => {
      byPriority[t.priority].total++;
      if (t.status === 'completed') byPriority[t.priority].completed++;
    });

    // By Category
    const byCategory: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = { total: 0, completed: 0 };
      byCategory[t.category].total++;
      if (t.status === 'completed') byCategory[t.category].completed++;
    });

    // Tasks completed this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completedThisWeek = tasks.filter(
      t => t.status === 'completed' && t.completedAt && new Date(t.completedAt) > weekAgo
    ).length;

    // Streak: days with at least one completion
    const completedDays = new Set(
      tasks
        .filter(t => t.completedAt)
        .map(t => new Date(t.completedAt!).toDateString())
    ).size;

    return { total, completed, overdue, pending, completionRate, byPriority, byCategory, completedThisWeek, completedDays };
  }, [tasks]);

  const maxPriority = Math.max(...Object.values(stats.byPriority).map(v => v.total), 1);
  const maxCategory = Math.max(...Object.values(stats.byCategory).map(v => v.total), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text style={styles.screenTitle}>Statistics</Text>
        <Text style={styles.screenSubtitle}>Your productivity overview</Text>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Tasks" value={stats.total} icon="📋" color={Colors.accent} />
          <SummaryCard label="Completed" value={stats.completed} icon="✅" color={Colors.success} />
          <SummaryCard label="Pending" value={stats.pending} icon="⏳" color={Colors.warning} />
          <SummaryCard label="Overdue" value={stats.overdue} icon="⚠️" color={Colors.danger} />
        </View>

        {/* Completion Rate Circle */}
        <View style={styles.rateCard}>
          <View style={styles.rateLeft}>
            <Text style={styles.rateTitle}>Completion Rate</Text>
            <Text style={styles.ratePercent}>{stats.completionRate}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stats.completionRate}%` as any }]} />
            </View>
          </View>
          <View style={styles.rateRight}>
            <Text style={styles.rateStatLabel}>This Week</Text>
            <Text style={styles.rateStatValue}>{stats.completedThisWeek}</Text>
            <Text style={styles.rateStatSub}>tasks done</Text>
            <View style={styles.rateDivider} />
            <Text style={styles.rateStatLabel}>Active Days</Text>
            <Text style={styles.rateStatValue}>{stats.completedDays}</Text>
            <Text style={styles.rateStatSub}>days productive</Text>
          </View>
        </View>

        {/* By Priority */}
        {stats.total > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 By Priority</Text>
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => {
              const data = stats.byPriority[p];
              if (data.total === 0) return null;
              const color = getPriorityColor(p);
              const pct = data.total / maxPriority;
              const donePct = data.total > 0 ? data.completed / data.total : 0;
              return (
                <View key={p} style={styles.barRow}>
                  <View style={styles.barLabelContainer}>
                    <Text style={styles.barLabel}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                    <Text style={styles.barSub}>{data.completed}/{data.total}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color + '33' }]} />
                    <View style={[styles.barFillDone, { width: `${pct * donePct * 100}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* By Category */}
        {stats.total > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📂 By Category</Text>
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([cat, data]) => {
                const color = getCategoryColor(cat);
                const pct = data.total / maxCategory;
                const donePct = data.total > 0 ? data.completed / data.total : 0;
                return (
                  <View key={cat} style={styles.barRow}>
                    <View style={styles.barLabelContainer}>
                      <Text style={styles.barLabel}>{getCategoryIcon(cat)} {cat}</Text>
                      <Text style={styles.barSub}>{data.completed}/{data.total}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color + '33' }]} />
                      <View style={[styles.barFillDone, { width: `${pct * donePct * 100}%` as any, backgroundColor: color }]} />
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {stats.total === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>Add some tasks to see your statistics here.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
};

const SummaryCard = ({ label, value, icon, color }: {
  label: string; value: number; icon: string; color: string;
}) => (
  <View style={[summaryStyles.card, { borderTopColor: color }]}>
    <Text style={summaryStyles.icon}>{icon}</Text>
    <Text style={[summaryStyles.value, { color }]}>{value}</Text>
    <Text style={summaryStyles.label}>{label}</Text>
  </View>
);

const summaryStyles = StyleSheet.create({
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
  icon: { fontSize: 22, marginBottom: 4 },
  value: { fontSize: Typography.size2XL, fontWeight: Typography.weightBlack, marginBottom: 2 },
  label: { fontSize: Typography.sizeXS, color: Colors.textMuted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { padding: Spacing.lg, paddingTop: Spacing.xl },
  screenTitle: {
    fontSize: Typography.size3XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  screenSubtitle: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs / 2,
    marginBottom: Spacing.md,
  },
  rateCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  rateLeft: { flex: 2, marginRight: Spacing.lg },
  rateTitle: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  ratePercent: {
    fontSize: Typography.size4XL,
    fontWeight: Typography.weightBlack,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.round,
  },
  rateRight: { flex: 1, justifyContent: 'center' },
  rateStatLabel: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  rateStatValue: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
  },
  rateStatSub: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  rateDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  chartCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  chartTitle: {
    fontSize: Typography.sizeLG,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  barLabelContainer: { width: 80 },
  barLabel: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  barSub: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.round,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: Radius.round,
    left: 0,
    top: 0,
  },
  barFillDone: {
    position: 'absolute',
    height: '100%',
    borderRadius: Radius.round,
    left: 0,
    top: 0,
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.sizeLG,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizeMD,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default StatsScreen;
