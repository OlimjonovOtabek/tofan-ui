import {
  NOTIFICATION_TYPES,
  NotificationType,
  TRAINER_STYLES,
  TrainerStyle,
} from './notification-attributes';
import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, TranslationKey> = {
  workoutReminder: 'notifications.types.workoutReminder',
  mealReminder: 'notifications.types.mealReminder',
  waterReminder: 'notifications.types.waterReminder',
  streakReminder: 'notifications.types.streakReminder',
  goalMilestone: 'notifications.types.goalMilestone',
  dpEarned: 'notifications.types.dpEarned',
  securityAlert: 'notifications.types.securityAlert',
  weeklyReport: 'notifications.types.weeklyReport',
  leaderboardChange: 'notifications.types.leaderboardChange',
};

export const TRAINER_STYLE_LABELS: Record<TrainerStyle, TranslationKey> = {
  soft: 'notifications.styles.soft',
  professional: 'notifications.styles.professional',
  aggressive: 'notifications.styles.aggressive',
};

export const NOTIFICATION_TYPE_OPTIONS = toSelectOptions(
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
);
export const TRAINER_STYLE_OPTIONS = toSelectOptions(TRAINER_STYLES, TRAINER_STYLE_LABELS);
