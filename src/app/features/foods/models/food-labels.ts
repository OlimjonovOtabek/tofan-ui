import { FOOD_SOURCES, FoodSource, SERVING_UNITS, ServingUnit } from './food-attributes';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';

export const SERVING_UNIT_LABELS: Record<ServingUnit, string> = {
  grams: 'enums.servingUnit.grams',
  milliliters: 'enums.servingUnit.milliliters',
  piece: 'enums.servingUnit.piece',
  slice: 'enums.servingUnit.slice',
  cup: 'enums.servingUnit.cup',
  tablespoon: 'enums.servingUnit.tablespoon',
  teaspoon: 'enums.servingUnit.teaspoon',
};

export const FOOD_SOURCE_LABELS: Record<FoodSource, string> = {
  system: 'enums.foodSource.system',
  userCustom: 'enums.foodSource.userCustom',
  aiScan: 'enums.foodSource.aiScan',
  imported: 'enums.foodSource.imported',
};

export const SERVING_UNIT_OPTIONS = toSelectOptions(SERVING_UNITS, SERVING_UNIT_LABELS);
export const FOOD_SOURCE_OPTIONS = toSelectOptions(FOOD_SOURCES, FOOD_SOURCE_LABELS);

export const FOOD_ACTIVITY_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'foods.filters.active' },
  { value: false, label: 'foods.filters.inactive' },
];

export const FOOD_VERIFICATION_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'foods.filters.verified' },
  { value: false, label: 'foods.filters.unverified' },
];
