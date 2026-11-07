import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';
import { MEAL_TYPES, MealType } from './meal-type';
import { TariffType } from './tariff-type';

export const TARIFF_TYPE_LABELS: Record<TariffType, TranslationKey> = {
  free: 'tariffs.type.free',
  standard: 'tariffs.type.standard',
  vip: 'tariffs.type.vip',
};

export const MEAL_TYPE_LABELS: Record<MealType, TranslationKey> = {
  breakfast: 'tariffs.mealType.breakfast',
  secondBreakfast: 'tariffs.mealType.secondBreakfast',
  lunch: 'tariffs.mealType.lunch',
  snack: 'tariffs.mealType.snack',
  dinner: 'tariffs.mealType.dinner',
  preWorkout: 'tariffs.mealType.preWorkout',
  postWorkout: 'tariffs.mealType.postWorkout',
};

export const MEAL_TYPE_OPTIONS = toSelectOptions(MEAL_TYPES, MEAL_TYPE_LABELS);
