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

export const FOOD_SOURCES = ['system', 'userCustom', 'aiScan', 'imported'] as const;
export type FoodSource = (typeof FOOD_SOURCES)[number];
