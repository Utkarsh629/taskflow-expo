// src/screens/main/AddTaskScreen.tsx
// Form to create new tasks with all required fields

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../../context/TaskContext';
import { Priority, TaskCategory } from '../../types';
import {
  Colors, Typography, Spacing, Radius, Shadow,
  getPriorityColor, getCategoryColor, getCategoryIcon,
} from '../../utils/theme';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const CATEGORIES: TaskCategory[] = ['personal', 'work', 'health', 'finance', 'learning', 'other'];

const AddTaskScreen = () => {
  const navigation = useNavigation<any>();
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Date/time state – simplified inputs (in a real app, use a date picker library)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [deadlineDate, setDeadlineDate] = useState(
    tomorrow.toISOString().split('T')[0]
  );
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('09:00');

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags(prev => [...prev, cleaned]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Task title is required';
    if (!deadlineDate) e.deadline = 'Deadline date is required';
    if (!scheduledDate) e.scheduled = 'Scheduled date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);

    if (isNaN(deadline.getTime())) {
      Alert.alert('Invalid Date', 'Please enter a valid deadline date (YYYY-MM-DD)');
      return;
    }

    await addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      deadline: deadline.toISOString(),
      dateTime: dateTime.toISOString(),
      tags,
    });

    Alert.alert('Success', 'Task added!', [
      { text: 'Add Another', onPress: resetForm },
      { text: 'View Tasks', onPress: () => navigation.navigate('Tasks') },
    ]);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('personal');
    setTags([]);
    setTagInput('');
    setErrors({});
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text style={styles.screenTitle}>New Task</Text>
        <Text style={styles.screenSubtitle}>Fill in the details below</Text>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Task Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors.textMuted}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details (optional)"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Priority</Text>
          <View style={styles.optionsRow}>
            {PRIORITIES.map(p => {
              const color = getPriorityColor(p);
              const active = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionChip,
                    { borderColor: color },
                    active && { backgroundColor: color },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.optionChipText,
                    { color: active ? Colors.white : color },
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Category</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map(c => {
              const color = getCategoryColor(c);
              const active = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.categoryChip,
                    { borderColor: color },
                    active && { backgroundColor: color + '33' },
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={styles.categoryIcon}>{getCategoryIcon(c)}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    { color: active ? color : Colors.textSecondary },
                    active && { fontWeight: Typography.weightBold },
                  ]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Scheduled Date/Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Scheduled Date & Time</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, errors.scheduled && styles.inputError]}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2025-01-15"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={scheduledTime}
                onChangeText={setScheduledTime}
                placeholder="09:00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
          {errors.scheduled && <Text style={styles.errorText}>{errors.scheduled}</Text>}
        </View>

        {/* Deadline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Deadline *</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, errors.deadline && styles.inputError]}
                value={deadlineDate}
                onChangeText={setDeadlineDate}
                placeholder="2025-01-20"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={deadlineTime}
                onChangeText={setDeadlineTime}
                placeholder="23:59"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
          {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Tags (up to 5)</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag..."
              placeholderTextColor={Colors.textMuted}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>#{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>✓ SAVE TASK</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
};

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
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizeMD,
    color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.danger },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizeXS,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    borderWidth: 1.5,
  },
  optionChipText: {
    fontSize: Typography.sizeSM,
    fontWeight: Typography.weightMedium,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    minWidth: '30%',
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateField: { flex: 2 },
  timeField: { flex: 1 },
  fieldLabel: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagInput: { flex: 1 },
  addTagBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  addTagBtnText: {
    color: Colors.accent,
    fontWeight: Typography.weightBold,
    fontSize: Typography.sizeSM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  tagText: {
    fontSize: Typography.sizeXS,
    color: Colors.accentLight,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.button,
  },
  saveButtonText: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightBold,
    color: Colors.white,
    letterSpacing: 2,
  },
});

export default AddTaskScreen;
