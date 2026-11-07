import { TranslationKey } from '@core/i18n/dictionary';
import { MEAL_TYPES, MealType } from './meal-type';
import { toSelectOptions } from './select-option';

export const MEAL_TYPE_LABELS: Record<MealType, TranslationKey> = {
  breakfast: 'enums.mealType.breakfast',
  secondBreakfast: 'enums.mealType.secondBreakfast',
  lunch: 'enums.mealType.lunch',
  snack: 'enums.mealType.snack',
  dinner: 'enums.mealType.dinner',
  preWorkout: 'enums.mealType.preWorkout',
  postWorkout: 'enums.mealType.postWorkout',
};

export const MEAL_TYPE_OPTIONS = toSelectOptions(MEAL_TYPES, MEAL_TYPE_LABELS);
