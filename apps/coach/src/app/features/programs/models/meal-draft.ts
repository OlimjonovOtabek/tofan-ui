import { MEAL_TYPES, MealType } from '@coach/core/fitness/meal-type';
import { Food, PickedFood, caloriesFor } from './food';
import { Meal, MealItem } from './meal-program';

export interface MealDraft {
  readonly key: string;
  readonly type: MealType;
  readonly title: string;
  readonly plannedTime: string | null;
  readonly options: readonly (readonly PickedFood[])[];
}

export function newMealDraft(key: string, type: MealType, title: string): MealDraft {
  return { key, type, title, plannedTime: null, options: [[]] };
}

export function dayOrderIndexFor(type: MealType, meals: readonly MealDraft[]): number {
  const rank = MEAL_TYPES.indexOf(type);
  const next = meals.findIndex((meal) => MEAL_TYPES.indexOf(meal.type) > rank);
  return next === -1 ? meals.length : next;
}

export function canSubmitMealProgram(name: string, meals: readonly MealDraft[]): boolean {
  return (
    name.trim().length > 0 &&
    meals.length > 0 &&
    meals.every((meal) => meal.options.every((option) => option.length > 0))
  );
}

export function optionCalories(items: readonly PickedFood[]): number {
  return items.reduce(
    (sum, item) => sum + (caloriesFor(item.food, item.quantity, item.unit) ?? 0),
    0,
  );
}

export function mealDraftsOf(meals: readonly Meal[]): MealDraft[] {
  return meals.map((meal) => ({
    key: meal.id,
    type: meal.type,
    title: meal.title,
    plannedTime: meal.plannedTime,
    options: optionsOf(meal.items),
  }));
}

function optionsOf(items: readonly MealItem[]): PickedFood[][] {
  const numbers = [...new Set(items.map((item) => item.optionNumber))].sort((a, b) => a - b);
  const options = numbers
    .map((number) =>
      items.filter((item) => item.optionNumber === number && item.quantity > 0).map(pickedOf),
    )
    .filter((option) => option.length > 0);
  return options.length === 0 ? [[]] : options;
}

function pickedOf(item: MealItem): PickedFood {
  const food: Food = {
    id: item.foodId,
    name: item.name,
    servingUnit: item.unit,
    servingSize: item.quantity,
    servingSizeGrams: item.quantityGrams,
    caloriesPerServing: item.calories,
  };
  return { food, quantity: item.quantity, unit: item.unit, estimatedCost: item.estimatedCost };
}
