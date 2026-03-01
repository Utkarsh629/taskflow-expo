// src/screens/main/TasksScreen.tsx
// Full task list with search, filter, and sort capabilities

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useTasks } from '../../context/TaskContext';
import { FilterType, SortType, Task } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadow, getPriorityColor, getCategoryColor, getCategoryIcon } from '../../utils/theme';
import { getRelativeTime, isOverdue, isDueToday, formatDate } from '../../utils/dateHelpers';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '📋' },
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'today', label: 'Today', icon: '📅' },
  { key: 'overdue', label: 'Overdue', icon: '⚠️' },
  { key: 'completed', label: 'Done', icon: '✅' },
];

const SORTS: { key: SortType; label: string }[] = [
  { key: 'smart', label: '🧠 Smart' },
  { key: 'deadline', label: '📅 Deadline' },
  { key: 'priority', label: '🎯 Priority' },
  { key: 'created', label: '🕐 Newest' },
  { key: 'alphabetical', label: '🔤 A-Z' },
];

const TasksScreen = () => {
  const { getFilteredAndSorted, toggleComplete, deleteTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('smart');
  const [search, setSearch] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const tasks = useMemo(
    () => getFilteredAndSorted(filter, sort, search),
    [filter, sort, search, getFilteredAndSorted]
  );

  const handleDelete = useCallback((task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
      ]
    );
  }, [deleteTask]);

  const renderTask = ({ item }: { item: Task }) => {
    const overdue = isOverdue(item.deadline, item.status);
    const dueToday = isDueToday(item.deadline);
    const isCompleted = item.status === 'completed';
    const isExpanded = expandedTask === item.id;
    const priorityColor = getPriorityColor(item.priority);
    const categoryColor = getCategoryColor(item.category);

    return (
      <View style={[styles.taskCard, isCompleted && styles.taskCardDone]}>
        <View style={[styles.priorityStrip, { backgroundColor: priorityColor }]} />

        <View style={styles.taskMain}>
          {/* Header row */}
          <View style={styles.taskHeader}>
            <TouchableOpacity
              style={[styles.checkbox, isCompleted && styles.checkboxDone]}
              onPress={() => toggleComplete(item.id)}
              activeOpacity={0.7}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.taskInfo}
              onPress={() => setExpandedTask(isExpanded ? null : item.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]} numberOfLines={isExpanded ? undefined : 2}>
                {item.title}
              </Text>

              <View style={styles.taskMeta}>
                <View style={[styles.categoryChip, { backgroundColor: categoryColor + '22' }]}>
                  <Text style={styles.categoryChipText}>{getCategoryIcon(item.category)} {item.category}</Text>
                </View>

                <Text style={[
                  styles.dueText,
                  overdue && styles.dueOverdue,
                  dueToday && !overdue && styles.dueToday,
                  isCompleted && styles.dueCompleted,
                ]}>
                  {isCompleted ? `✅ Done ${formatDate(item.completedAt || item.createdAt)}` : getRelativeTime(item.deadline)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              <View style={styles.detailsGrid}>
                <DetailChip icon="🎯" label="Priority" value={item.priority} color={priorityColor} />
                <DetailChip icon="📅" label="Deadline" value={formatDate(item.deadline)} color={Colors.textSecondary} />
                <DetailChip icon="🕐" label="Scheduled" value={formatDate(item.dateTime)} color={Colors.textSecondary} />
              </View>

              {item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const currentSortLabel = SORTS.find(s => s.key === sort)?.label || 'Sort';

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks, tags..."
          placeholderTextColor={Colors.textMuted}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={i => i.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
                {item.icon} {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        />
      </View>

      {/* Sort + Count */}
      <View style={styles.toolbar}>
        <Text style={styles.taskCount}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(v => !v)}
        >
          <Text style={styles.sortButtonText}>{currentSortLabel} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORTS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortOption, sort === s.key && styles.sortOptionActive]}
              onPress={() => { setSort(s.key); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortOptionText, sort === s.key && styles.sortOptionTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {filter === 'completed' ? '🎉' : filter === 'overdue' ? '👍' : '📭'}
            </Text>
            <Text style={styles.emptyTitle}>
              {filter === 'completed'
                ? 'Nothing completed yet'
                : filter === 'overdue'
                ? 'No overdue tasks!'
                : 'No tasks found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'overdue' ? "You're all caught up!" : 'Try a different filter or add a new task.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const DetailChip = ({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string;
}) => (
  <View style={detailStyles.chip}>
    <Text style={detailStyles.chipIcon}>{icon}</Text>
    <View>
      <Text style={detailStyles.chipLabel}>{label}</Text>
      <Text style={[detailStyles.chipValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const detailStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    flex: 1,
    minWidth: 90,
  },
  chipIcon: { fontSize: 16 },
  chipLabel: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
  },
  chipValue: {
    fontSize: Typography.sizeSM,
    fontWeight: Typography.weightMedium,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.sizeMD,
    color: Colors.textPrimary,
  },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    backgroundColor: Colors.bgCard,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
  },
  filterChipTextActive: {
    color: Colors.accent,
    fontWeight: Typography.weightBold,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  taskCount: {
    fontSize: Typography.sizeSM,
    color: Colors.textMuted,
    fontWeight: Typography.weightMedium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonText: {
    fontSize: Typography.sizeSM,
    color: Colors.accent,
    fontWeight: Typography.weightMedium,
  },
  sortMenu: {
    position: 'absolute',
    right: Spacing.lg,
    top: 160,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    ...Shadow.card,
  },
  sortOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sortOptionActive: {
    backgroundColor: Colors.accentDim,
  },
  sortOptionText: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
  },
  sortOptionTextActive: {
    color: Colors.accent,
    fontWeight: Typography.weightBold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.card,
  },
  taskCardDone: {
    opacity: 0.65,
  },
  priorityStrip: {
    width: 4,
  },
  taskMain: {
    flex: 1,
    padding: Spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: Typography.weightBold,
  },
  taskInfo: { flex: 1 },
  taskTitle: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.round,
  },
  categoryChipText: {
    fontSize: Typography.sizeXS,
    color: Colors.textSecondary,
  },
  dueText: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
  },
  dueOverdue: { color: Colors.danger },
  dueToday: { color: Colors.warning },
  dueCompleted: { color: Colors.success },
  deleteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  deleteBtnText: { fontSize: 18 },
  expandedContent: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  description: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.round,
  },
  tagText: {
    fontSize: Typography.sizeXS,
    color: Colors.accentLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
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

export default TasksScreen;
