// src/utils/theme.ts
// Design tokens — a dark, editorial aesthetic with vivid accent colors

export const Colors = {
  // Backgrounds
  bg: '#0A0A0F',
  bgCard: '#13131A',
  bgCardElevated: '#1C1C28',
  bgInput: '#16161F',

  // Borders
  border: '#2A2A3A',
  borderFocus: '#6C63FF',

  // Text
  textPrimary: '#F0F0F8',
  textSecondary: '#8A8AA8',
  textMuted: '#4A4A68',

  // Brand
  accent: '#6C63FF',
  accentLight: '#8B85FF',
  accentDim: 'rgba(108, 99, 255, 0.15)',

  // Status colors
  success: '#2ECC71',
  successDim: 'rgba(46, 204, 113, 0.15)',
  warning: '#F39C12',
  warningDim: 'rgba(243, 156, 18, 0.15)',
  danger: '#E74C3C',
  dangerDim: 'rgba(231, 76, 60, 0.15)',
  info: '#3498DB',
  infoDim: 'rgba(52, 152, 219, 0.15)',

  // Priority colors
  priorityCritical: '#FF4757',
  priorityHigh: '#FF6B35',
  priorityMedium: '#FFA726',
  priorityLow: '#66BB6A',

  // Category colors
  categoryPersonal: '#EC407A',
  categoryWork: '#42A5F5',
  categoryHealth: '#66BB6A',
  categoryFinance: '#FFA726',
  categoryLearning: '#AB47BC',
  categoryOther: '#78909C',

  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  // Display font: Oswald-like weight — use 'System' fallback
  fontDisplay: 'System',
  fontBody: 'System',

  sizeXS: 11,
  sizeSM: 13,
  sizeMD: 15,
  sizeLG: 17,
  sizeXL: 20,
  size2XL: 24,
  size3XL: 32,
  size4XL: 40,

  weightLight: '300' as const,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightBlack: '900' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Priority display helpers
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return Colors.priorityCritical;
    case 'high': return Colors.priorityHigh;
    case 'medium': return Colors.priorityMedium;
    case 'low': return Colors.priorityLow;
    default: return Colors.textSecondary;
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'personal': return Colors.categoryPersonal;
    case 'work': return Colors.categoryWork;
    case 'health': return Colors.categoryHealth;
    case 'finance': return Colors.categoryFinance;
    case 'learning': return Colors.categoryLearning;
    default: return Colors.categoryOther;
  }
};

export const getPriorityLabel = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'personal': return '👤';
    case 'work': return '💼';
    case 'health': return '❤️';
    case 'finance': return '💰';
    case 'learning': return '📚';
    default: return '📌';
  }
};
