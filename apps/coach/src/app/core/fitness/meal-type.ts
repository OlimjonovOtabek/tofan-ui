import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const MEAL_TYPES = [
  'breakfast',
  'secondBreakfast',
  'lunch',
  'snack',
  'dinner',
  'preWorkout',
  'postWorkout',
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, TranslationKey> = {
  breakfast: 'coachApp.meal.breakfast',
  secondBreakfast: 'coachApp.meal.secondBreakfast',
  lunch: 'coachApp.meal.lunch',
  snack: 'coachApp.meal.snack',
  dinner: 'coachApp.meal.dinner',
  preWorkout: 'coachApp.meal.preWorkout',
  postWorkout: 'coachApp.meal.postWorkout',
};

export const MEAL_TYPE_OPTIONS = toSelectOptions(MEAL_TYPES, MEAL_TYPE_LABELS);
