import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, TranslationKey> = {
  beginner: 'coach.programs.levels.beginner',
  intermediate: 'coach.programs.levels.intermediate',
  advanced: 'coach.programs.levels.advanced',
};

export const EXPERIENCE_LEVEL_OPTIONS = toSelectOptions(EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS);

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, TranslationKey> = {
  monday: 'coach.programs.weekdays.monday',
  tuesday: 'coach.programs.weekdays.tuesday',
  wednesday: 'coach.programs.weekdays.wednesday',
  thursday: 'coach.programs.weekdays.thursday',
  friday: 'coach.programs.weekdays.friday',
  saturday: 'coach.programs.weekdays.saturday',
  sunday: 'coach.programs.weekdays.sunday',
};

export const WEEKDAY_OPTIONS = toSelectOptions(WEEKDAYS, WEEKDAY_LABELS);

export const WORKOUT_SPLITS = [
  'fullBody',
  'upperLower',
  'pushPullLegs',
  'broSplit',
  'cardio',
  'mobility',
  'custom',
  'rest',
] as const;
export type WorkoutSplit = (typeof WORKOUT_SPLITS)[number];

export const WORKOUT_SPLIT_LABELS: Record<WorkoutSplit, TranslationKey> = {
  fullBody: 'coach.programs.splits.fullBody',
  upperLower: 'coach.programs.splits.upperLower',
  pushPullLegs: 'coach.programs.splits.pushPullLegs',
  broSplit: 'coach.programs.splits.broSplit',
  cardio: 'coach.programs.splits.cardio',
  mobility: 'coach.programs.splits.mobility',
  custom: 'coach.programs.splits.custom',
  rest: 'coach.programs.splits.rest',
};

export const WORKOUT_SPLIT_OPTIONS = toSelectOptions(WORKOUT_SPLITS, WORKOUT_SPLIT_LABELS);
