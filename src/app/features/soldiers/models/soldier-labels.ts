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

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Erkak',
  female: 'Ayol',
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  loseWeight: 'Vazn tashlash',
  gainMuscle: 'Mushak yig‘ish',
  maintain: 'Vaznni saqlash',
  recomposition: 'Rekompozitsiya',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Boshlang‘ich',
  intermediate: 'O‘rta',
  advanced: 'Yuqori',
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Kam harakat',
  light: 'Yengil',
  moderate: 'O‘rtacha',
  active: 'Faol',
  veryActive: 'Juda faol',
};

export const GOAL_PACE_LABELS: Record<GoalPace, string> = {
  slow: 'Sekin',
  moderate: 'O‘rtacha',
  aggressive: 'Tez',
};

export const TRAINER_STYLE_LABELS: Record<TrainerStyle, string> = {
  soft: 'Yumshoq',
  professional: 'Professional',
  aggressive: 'Qattiqqo‘l',
};

export const WEIGHT_SOURCE_LABELS: Record<WeightSource, string> = {
  manual: 'Qo‘lda',
  estimated: 'Taxminiy',
  healthSync: 'Health ilovasi',
};

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  0: 'Yakshanba',
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
};

export const WORKOUT_PLACE_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Uyda' },
  { value: false, label: 'Zalda' },
];

export const GENDER_OPTIONS = toSelectOptions(GENDERS, GENDER_LABELS);
export const FITNESS_GOAL_OPTIONS = toSelectOptions(FITNESS_GOALS, FITNESS_GOAL_LABELS);
export const EXPERIENCE_LEVEL_OPTIONS = toSelectOptions(EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS);
