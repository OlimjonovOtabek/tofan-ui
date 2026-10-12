import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import {
  ActivityLevel,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
  FITNESS_GOALS,
  FitnessGoal,
  GENDERS,
  Gender,
  GoalPace,
  TrainerStyle,
  WeekDay,
  WeightSource,
} from './soldier-attributes';

export const GENDER_LABELS: Record<Gender, TranslationKey> = {
  male: 'soldiers.gender.male',
  female: 'soldiers.gender.female',
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, TranslationKey> = {
  loseWeight: 'soldiers.goal.loseWeight',
  gainMuscle: 'soldiers.goal.gainMuscle',
  maintain: 'soldiers.goal.maintain',
  recomposition: 'soldiers.goal.recomposition',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, TranslationKey> = {
  beginner: 'soldiers.experience.beginner',
  intermediate: 'soldiers.experience.intermediate',
  advanced: 'soldiers.experience.advanced',
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, TranslationKey> = {
  sedentary: 'soldiers.activity.sedentary',
  light: 'soldiers.activity.light',
  moderate: 'soldiers.activity.moderate',
  active: 'soldiers.activity.active',
  veryActive: 'soldiers.activity.veryActive',
};

export const GOAL_PACE_LABELS: Record<GoalPace, TranslationKey> = {
  slow: 'soldiers.pace.slow',
  moderate: 'soldiers.pace.moderate',
  aggressive: 'soldiers.pace.aggressive',
};

export const TRAINER_STYLE_LABELS: Record<TrainerStyle, TranslationKey> = {
  soft: 'soldiers.trainerStyle.soft',
  professional: 'soldiers.trainerStyle.professional',
  aggressive: 'soldiers.trainerStyle.aggressive',
};

export const WEIGHT_SOURCE_LABELS: Record<WeightSource, TranslationKey> = {
  manual: 'soldiers.weightSource.manual',
  estimated: 'soldiers.weightSource.estimated',
  healthSync: 'soldiers.weightSource.healthSync',
};

export const WEEK_DAY_LABELS: Record<WeekDay, TranslationKey> = {
  0: 'soldiers.weekDays.sunday',
  1: 'soldiers.weekDays.monday',
  2: 'soldiers.weekDays.tuesday',
  3: 'soldiers.weekDays.wednesday',
  4: 'soldiers.weekDays.thursday',
  5: 'soldiers.weekDays.friday',
  6: 'soldiers.weekDays.saturday',
};

export const WORKOUT_PLACE_LABELS: Record<'home' | 'gym', TranslationKey> = {
  home: 'soldiers.place.home',
  gym: 'soldiers.place.gym',
};

export const WORKOUT_PLACE_OPTIONS: SelectOption<boolean, TranslationKey>[] = [
  { value: true, label: WORKOUT_PLACE_LABELS.home },
  { value: false, label: WORKOUT_PLACE_LABELS.gym },
];

export const GENDER_OPTIONS = toSelectOptions(GENDERS, GENDER_LABELS);
export const FITNESS_GOAL_OPTIONS = toSelectOptions(FITNESS_GOALS, FITNESS_GOAL_LABELS);
export const EXPERIENCE_LEVEL_OPTIONS = toSelectOptions(EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS);

export function workoutPlaceLabel(isHomeWorkout: boolean): TranslationKey {
  return isHomeWorkout ? WORKOUT_PLACE_LABELS.home : WORKOUT_PLACE_LABELS.gym;
}
