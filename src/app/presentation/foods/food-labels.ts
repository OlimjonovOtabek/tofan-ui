import {
  FOOD_SOURCES,
  FoodSource,
  SERVING_UNITS,
  ServingUnit,
} from '@domain/foods/food-attributes';
import { toSelectOptions } from '@presentation/shared/forms/select-option';

/** Uzbek wording for the food classifiers; the domain keeps the values language-free. */
export const SERVING_UNIT_LABELS: Record<ServingUnit, string> = {
  grams: 'gramm',
  milliliters: 'ml',
  piece: 'dona',
  slice: 'bo‘lak',
  cup: 'stakan',
  tablespoon: "osh qoshiq",
  teaspoon: 'choy qoshiq',
};

export const FOOD_SOURCE_LABELS: Record<FoodSource, string> = {
  system: 'Tizim',
  userCustom: 'Foydalanuvchi',
  aiScan: 'AI skaner',
  imported: 'Import',
};

export const SERVING_UNIT_OPTIONS = toSelectOptions(SERVING_UNITS, SERVING_UNIT_LABELS);
export const FOOD_SOURCE_OPTIONS = toSelectOptions(FOOD_SOURCES, FOOD_SOURCE_LABELS);
