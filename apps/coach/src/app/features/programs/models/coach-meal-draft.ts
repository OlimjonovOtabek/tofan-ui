import { MealType } from '@coach/core/fitness/meal-type';

export interface MealFoodChoice {
  id: string;
  name: string;
  nameRu: string;
  nameUz: string;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
}

export interface MealItemDraft {
  key: string;
  foodId: string;
  name: string;
  nameRu: string;
  nameUz: string;
  quantityGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  estimatedCost: number | null;
}

export interface MealDraft {
  key: string;
  id: string | null;
  mealType: MealType;
  plannedTime: string | null;
  title: string;
  displayOrder: number;
  items: readonly MealItemDraft[];
}

export interface MealProgramDraft {
  startDate: string;
  endDate: string;
  meals: readonly MealDraft[];
}

export interface NutritionTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export type MealDraftIssue = 'dates' | 'quantity';

const DEFAULT_QUANTITY_GRAMS = 100;
const MIN_SERVING_GRAMS = 0.1;
const NO_NUTRITION: NutritionTotals = { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };

export function newMeal(key: string, mealType: MealType, title: string, displayOrder: number): MealDraft {
  return { key, id: null, mealType, plannedTime: null, title: title.trim(), displayOrder, items: [] };
}

export function newMealItem(key: string, food: MealFoodChoice): MealItemDraft {
  const scale = DEFAULT_QUANTITY_GRAMS / Math.max(food.servingSizeGrams, MIN_SERVING_GRAMS);
  return {
    key,
    foodId: food.id,
    name: food.name,
    nameRu: food.nameRu,
    nameUz: food.nameUz,
    quantityGrams: DEFAULT_QUANTITY_GRAMS,
    calories: Math.round(food.caloriesPerServing * scale),
    proteinGrams: food.proteinGrams * scale,
    carbsGrams: food.carbsGrams * scale,
    fatGrams: food.fatGrams * scale,
    estimatedCost: null,
  };
}

export function withQuantity(item: MealItemDraft, quantityGrams: number): MealItemDraft {
  const ratio = item.quantityGrams <= 0 ? 1 : quantityGrams / item.quantityGrams;
  return {
    ...item,
    quantityGrams,
    calories: Math.round(item.calories * ratio),
    proteinGrams: item.proteinGrams * ratio,
    carbsGrams: item.carbsGrams * ratio,
    fatGrams: item.fatGrams * ratio,
  };
}

export function nutritionTotals(items: readonly MealItemDraft[]): NutritionTotals {
  return items.reduce<NutritionTotals>(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      proteinGrams: sum.proteinGrams + item.proteinGrams,
      carbsGrams: sum.carbsGrams + item.carbsGrams,
      fatGrams: sum.fatGrams + item.fatGrams,
    }),
    NO_NUTRITION,
  );
}

export function mealDraftIssue(draft: MealProgramDraft | null): MealDraftIssue | null {
  if (draft === null) {
    return null;
  }
  if (draft.startDate === '' || draft.endDate === '' || draft.startDate > draft.endDate) {
    return 'dates';
  }
  const hasBadQuantity = draft.meals.some((meal) =>
    meal.items.some((item) => !(item.quantityGrams > 0)),
  );
  return hasBadQuantity ? 'quantity' : null;
}
