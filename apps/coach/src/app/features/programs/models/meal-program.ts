import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { MealType } from '@coach/core/fitness/meal-type';
import { ServingUnit } from '@coach/core/fitness/serving-unit';
import { LocalizedText } from '@shared/models/localized-text';

export const MEAL_PROGRAM_NAME_MAX = 200;

export interface MealProgram {
  readonly id: string;
  readonly name: string;
  readonly goal: FitnessGoal | null;
  readonly isPublished: boolean;
  readonly mealCount: number;
}

export interface MealItem {
  readonly id: string;
  readonly foodId: string;
  readonly name: LocalizedText;
  readonly quantity: number;
  readonly unit: ServingUnit;
  readonly quantityGrams: number;
  readonly calories: number;
  readonly estimatedCost: number | null;
  readonly optionNumber: number;
}

export interface Meal {
  readonly id: string;
  readonly type: MealType;
  readonly plannedTime: string | null;
  readonly title: string;
  readonly items: readonly MealItem[];
}

export interface MealTotals {
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbsGrams: number;
  readonly fatGrams: number;
  readonly estimatedCost: number;
}

export interface OptionTotals {
  readonly mealId: string;
  readonly optionNumber: number;
  readonly totals: MealTotals;
}

export interface MealProgramDetail extends MealProgram {
  readonly meals: readonly Meal[];
  readonly totals: MealTotals | null;
  readonly optionTotals: readonly OptionTotals[];
}

export interface MealOption {
  readonly number: number;
  readonly items: readonly MealItem[];
  readonly calories: number;
}

export function mealOptions(meal: Meal, optionTotals: readonly OptionTotals[]): MealOption[] {
  const numbers = [...new Set(meal.items.map((item) => item.optionNumber))].sort((a, b) => a - b);
  return numbers.map((number) => {
    const items = meal.items.filter((item) => item.optionNumber === number);
    const totals = optionTotals.find(
      (option) => option.mealId === meal.id && option.optionNumber === number,
    );
    return {
      number,
      items,
      calories: totals?.totals.calories ?? items.reduce((sum, item) => sum + item.calories, 0),
    };
  });
}

export function hasSeveralOptions(meals: readonly Meal[]): boolean {
  return meals.some((meal) => meal.items.some((item) => item.optionNumber > 1));
}

export function mealClock(time: string | null): string | null {
  return time === null || time.length < 5 ? null : time.slice(0, 5);
}
