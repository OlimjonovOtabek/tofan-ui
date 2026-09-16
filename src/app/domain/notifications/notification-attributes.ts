/** Notification classifiers. The wire format is an integer enum; infrastructure maps between them. */
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

/** The voice a trainee chose for their coach; templates are written once per style. */
export const TRAINER_STYLES = ['soft', 'professional', 'aggressive'] as const;
export type TrainerStyle = (typeof TRAINER_STYLES)[number];

/**
 * The style the backend falls back to when a trainee's own style has no active template,
 * so an active template in this style is what makes a type reachable for everyone.
 */
export const FALLBACK_TRAINER_STYLE: TrainerStyle = 'professional';

/** Push provider limits, mirrored from the backend validators. */
export const NOTIFICATION_TITLE_MAX_LENGTH = 256;
export const NOTIFICATION_BODY_MAX_LENGTH = 2048;
