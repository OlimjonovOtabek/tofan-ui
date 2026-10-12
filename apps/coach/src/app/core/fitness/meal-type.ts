import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'preWorkout',
  'postWorkout',
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, TranslationKey> = {
  breakfast: 'coach.clients.mealTypes.breakfast',
  lunch: 'coach.clients.mealTypes.lunch',
  dinner: 'coach.clients.mealTypes.dinner',
  snack: 'coach.clients.mealTypes.snack',
  preWorkout: 'coach.clients.mealTypes.preWorkout',
  postWorkout: 'coach.clients.mealTypes.postWorkout',
};

export const MEAL_TYPE_OPTIONS = toSelectOptions(MEAL_TYPES, MEAL_TYPE_LABELS);
