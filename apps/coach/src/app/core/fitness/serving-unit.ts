import { TranslationKey } from '@core/i18n/dictionary';

export const SERVING_UNITS = [
  'grams',
  'milliliters',
  'piece',
  'slice',
  'cup',
  'tablespoon',
  'teaspoon',
] as const;
export type ServingUnit = (typeof SERVING_UNITS)[number];

export const SERVING_UNIT_LABELS: Record<ServingUnit, TranslationKey> = {
  grams: 'coachApp.foodUnit.grams',
  milliliters: 'coachApp.foodUnit.milliliters',
  piece: 'coachApp.foodUnit.piece',
  slice: 'coachApp.foodUnit.slice',
  cup: 'coachApp.foodUnit.cup',
  tablespoon: 'coachApp.foodUnit.tablespoon',
  teaspoon: 'coachApp.foodUnit.teaspoon',
};
