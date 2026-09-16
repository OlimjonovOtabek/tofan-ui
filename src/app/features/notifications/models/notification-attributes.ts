export const NOTIFICATION_TYPES = [
  'workoutReminder',
  'mealReminder',
  'waterReminder',
  'streakReminder',
  'goalMilestone',
  'dpEarned',
  'securityAlert',
  'weeklyReport',
  'leaderboardChange',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const TRAINER_STYLES = ['soft', 'professional', 'aggressive'] as const;
export type TrainerStyle = (typeof TRAINER_STYLES)[number];

export const FALLBACK_TRAINER_STYLE: TrainerStyle = 'professional';

export const NOTIFICATION_TITLE_MAX_LENGTH = 256;
export const NOTIFICATION_BODY_MAX_LENGTH = 2048;
