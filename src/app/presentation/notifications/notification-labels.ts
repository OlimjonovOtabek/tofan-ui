import {
  NOTIFICATION_TYPES,
  NotificationType,
  TRAINER_STYLES,
  TrainerStyle,
} from '@domain/notifications/notification-attributes';
import { toSelectOptions } from '@presentation/shared/forms/select-option';

/** Uzbek wording for the notification classifiers; the domain keeps the values language-free. */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  workoutReminder: 'Mashg‘ulot eslatmasi',
  mealReminder: 'Ovqatlanish eslatmasi',
  waterReminder: 'Suv ichish eslatmasi',
  streakReminder: 'Ketma-ketlik eslatmasi',
  goalMilestone: 'Maqsad bosqichi',
  dpEarned: 'DP olindi',
  securityAlert: 'Xavfsizlik ogohlantirishi',
  weeklyReport: 'Haftalik hisobot',
  leaderboardChange: 'Reytingdagi o‘zgarish',
};

export const TRAINER_STYLE_LABELS: Record<TrainerStyle, string> = {
  soft: 'Yumshoq',
  professional: 'Professional',
  aggressive: 'Qattiqqo‘l',
};

export const NOTIFICATION_TYPE_OPTIONS = toSelectOptions(
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
);
export const TRAINER_STYLE_OPTIONS = toSelectOptions(TRAINER_STYLES, TRAINER_STYLE_LABELS);
