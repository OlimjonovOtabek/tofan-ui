import { fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { mealTypes } from '@coach/core/fitness/meal-type.dto';
import { servingUnits } from '@coach/core/fitness/serving-unit.dto';
import { Food } from '../models/food';
import { MealDraft } from '../models/meal-draft';
import { Meal, MealItem, MealProgram, MealProgramDetail, MealTotals } from '../models/meal-program';
import {
  FoodResponse,
  MealItemResponse,
  MealProgramDetailResponse,
  MealProgramRequest,
  MealProgramResponse,
  MealResponse,
  MealTotalsResponse,
} from './program.dto';

const FIRST_OPTION = 1;

export function toMealProgram(response: MealProgramResponse): MealProgram {
  return {
    id: response.id,
    name: response.name?.trim() ?? '',
    goal: response.goal === null ? null : fitnessGoals.toDomainOrNull(response.goal),
    isPublished: response.isPublished,
    mealCount: response.mealCount,
  };
}

export function toMealProgramDetail(response: MealProgramDetailResponse): MealProgramDetail {
  const meals = [...(response.meals ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(toMeal);
  return {
    ...toMealProgram({ ...response, mealCount: meals.length }),
    meals,
    totals: response.totals === null ? null : toTotals(response.totals),
    optionTotals: (response.optionTotals ?? []).map((option) => ({
      mealId: option.mealPlanMealId,
      optionNumber: option.optionNumber,
      totals: toTotals(option.totals),
    })),
  };
}

function toMeal(response: MealResponse): Meal {
  return {
    id: response.id,
    type: mealTypes.toDomainOrNull(response.mealType) ?? 'snack',
    plannedTime: response.plannedTime,
    title: response.title?.trim() ?? '',
    items: (response.items ?? []).map(toMealItem),
  };
}

function toMealItem(response: MealItemResponse): MealItem {
  return {
    id: response.id,
    foodId: response.foodId,
    name: {
      en: response.foodName ?? '',
      uz: response.foodNameUz ?? '',
      ru: response.foodNameRu ?? '',
    },
    quantity: response.quantity ?? response.quantityGrams ?? 0,
    unit: (response.unit === null ? null : servingUnits.toDomainOrNull(response.unit)) ?? 'grams',
    quantityGrams: response.quantityGrams ?? 0,
    calories: response.calories ?? 0,
    estimatedCost: response.estimatedCost,
    optionNumber: response.optionNumber ?? FIRST_OPTION,
  };
}

function toTotals(response: MealTotalsResponse): MealTotals {
  return { ...response };
}

export function toFood(response: FoodResponse): Food {
  return {
    id: response.id,
    name: { en: response.name ?? '', uz: response.nameUz ?? '', ru: response.nameRu ?? '' },
    servingUnit:
      (response.servingUnit === null ? null : servingUnits.toDomainOrNull(response.servingUnit)) ??
      'grams',
    servingSize: response.servingSize,
    servingSizeGrams: response.servingSizeGrams,
    caloriesPerServing: response.caloriesPerServing,
  };
}

export function toMealProgramRequest(
  name: string,
  goal: FitnessGoal | null,
  meals: readonly MealDraft[],
): MealProgramRequest {
  return {
    name: name.trim(),
    ...(goal === null ? {} : { goal: fitnessGoals.toApi(goal) }),
    meals: meals.map((meal, index) => ({
      mealType: mealTypes.toApi(meal.type),
      ...(meal.plannedTime === null ? {} : { plannedTime: meal.plannedTime }),
      title: meal.title,
      displayOrder: index,
      items: meal.options.flatMap((option, optionIndex) =>
        option.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
          unit: servingUnits.toApi(item.unit),
          ...(item.estimatedCost === null ? {} : { estimatedCost: item.estimatedCost }),
          optionNumber: optionIndex + FIRST_OPTION,
        })),
      ),
    })),
  };
}
