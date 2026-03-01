// src/utils/dateHelpers.ts
// Utility functions for date formatting and calculations

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Due today';
    if (absDays === 1) return '1 day overdue';
    return `${absDays} days overdue`;
  }

  if (diffHours < 1) return 'Due in < 1 hour';
  if (diffHours < 24) return `Due in ${diffHours}h`;
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 30) return `Due in ${Math.round(diffDays / 7)} weeks`;
  return `Due ${formatDate(dateString)}`;
};

export const isOverdue = (dateString: string, status: string): boolean => {
  return status !== 'completed' && new Date(dateString) < new Date();
};

export const isDueToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const getDueDateColor = (dateString: string, status: string, colors: any): string => {
  if (status === 'completed') return colors.success;
  if (isOverdue(dateString, status)) return colors.danger;
  if (isDueToday(dateString)) return colors.warning;
  return colors.textSecondary;
};
