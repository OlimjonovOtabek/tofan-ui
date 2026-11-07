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
