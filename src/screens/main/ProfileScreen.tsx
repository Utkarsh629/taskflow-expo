// src/screens/main/ProfileScreen.tsx
// User profile with account info and settings

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';
import { formatDate, isOverdue } from '../../utils/dateHelpers';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { tasks } = useTasks();

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.deadline, t.status)).length,
  }), [tasks]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatarLarge, { backgroundColor: user.avatarColor }]}>
          <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.memberBadge}>
          <Text style={styles.memberText}>
            Member since {formatDate(user.createdAt)}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: stats.overdue > 0 ? Colors.danger : Colors.textPrimary }]}>
            {stats.overdue}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* About App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About TaskFlow</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="✦" label="Version" value="1.0.0" />
          <InfoRow icon="🏗" label="Built with" value="React Native + TypeScript" />
          <InfoRow icon="💾" label="Storage" value="Local (AsyncStorage)" />
          <InfoRow icon="🔐" label="Auth" value="Local credential store" />
          <InfoRow icon="🧠" label="Sort algorithm" value="Smart (urgency + priority)" />
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresCard}>
          {[
            '✅ User authentication (Register / Login)',
            '📋 Task management (Add, Edit, Delete)',
            '🎯 Priority levels (Low → Critical)',
            '📂 6 task categories',
            '🏷️ Custom tags',
            '📅 Deadline + scheduled date/time',
            '🔍 Search across title, description & tags',
            '⚡ Filter: All, Pending, Today, Overdue, Done',
            '🧠 Smart sort algorithm',
            '📊 Analytics dashboard',
            '💾 Persistent local storage',
            '👥 Multi-user support',
          ].map((f, i) => (
            <Text key={i} style={styles.featureItem}>{f}</Text>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.icon}>{icon}</Text>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  icon: { fontSize: 16, width: 24 },
  label: {
    flex: 1,
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Typography.sizeSM,
    color: Colors.textMuted,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.button,
  },
  avatarText: {
    fontSize: Typography.size4XL,
    fontWeight: Typography.weightBlack,
    color: Colors.white,
  },
  userName: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.sizeMD,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  memberBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  memberText: {
    fontSize: Typography.sizeXS,
    color: Colors.accentLight,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.size2XL,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.sizeXS,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizeLG,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  featuresCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  featureItem: {
    fontSize: Typography.sizeSM,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: Colors.dangerDim,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger + '44',
  },
  logoutText: {
    fontSize: Typography.sizeMD,
    fontWeight: Typography.weightBold,
    color: Colors.danger,
    letterSpacing: 1,
  },
});

export default ProfileScreen;
