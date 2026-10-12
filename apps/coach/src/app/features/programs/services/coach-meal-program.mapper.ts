import { mealTypes } from '@coach/core/fitness/meal-type.dto';
import { mealProgramName } from '../models/coach-meal-program-name';
import { MealFoodChoice, MealProgramDraft } from '../models/coach-meal-draft';
import { CatalogFood, OwnFood } from './coach-program-library.dto';
import {
  MealProgramDetails,
  MealProgramSummary,
  UpdateMealProgramRequest,
} from './coach-program.dto';

export function toMealProgramDraft(program: MealProgramDetails): MealProgramDraft {
  return {
    startDate: program.startDate,
    endDate: program.endDate,
    meals: program.meals.map((meal) => ({
      key: meal.id,
      id: meal.id,
      mealType: mealTypes.toDomain(meal.mealType),
      plannedTime: meal.plannedTime,
      title: meal.title,
      displayOrder: meal.displayOrder,
      items: meal.items.map((item) => ({
        key: item.id,
        foodId: item.foodId,
        name: item.foodName,
        nameRu: item.foodNameRu,
        nameUz: item.foodNameUz,
        quantityGrams: item.quantityGrams,
        calories: item.calories,
        proteinGrams: item.proteinGrams,
        carbsGrams: item.carbsGrams,
        fatGrams: item.fatGrams,
        estimatedCost: item.estimatedCost,
      })),
    })),
  };
}

export function toUpdateMealProgramRequest(draft: MealProgramDraft): UpdateMealProgramRequest {
  return {
    name: mealProgramName(draft.startDate, draft.endDate),
    startDate: draft.startDate,
    endDate: draft.endDate,
    meals: draft.meals.map((meal) => ({
      mealType: mealTypes.toApi(meal.mealType),
      plannedTime: meal.plannedTime,
      title: meal.title,
      displayOrder: meal.displayOrder,
      items: meal.items.map((item) => ({
        foodId: item.foodId,
        quantityGrams: item.quantityGrams,
        estimatedCost: item.estimatedCost,
      })),
    })),
  };
}

export function toCatalogFoodChoice(food: CatalogFood): MealFoodChoice {
  return {
    id: food.id,
    name: food.name,
    nameRu: food.nameRu,
    nameUz: food.nameUz,
    servingSizeGrams: food.servingSizeGrams,
    caloriesPerServing: food.caloriesPerServing,
    proteinGrams: food.proteinGrams,
    carbsGrams: food.carbsGrams,
    fatGrams: food.fatGrams,
    fiberGrams: food.fiberGrams,
  };
}

export function toOwnFoodChoice(food: OwnFood): MealFoodChoice {
  return {
    id: food.id,
    name: food.name,
    nameRu: food.name,
    nameUz: food.name,
    servingSizeGrams: food.servingSizeGrams,
    caloriesPerServing: food.caloriesPerServing,
    proteinGrams: food.proteinGrams,
    carbsGrams: food.carbsGrams,
    fatGrams: food.fatGrams,
    fiberGrams: food.fiberGrams,
  };
}

export function isMealProgramPublished(programs: readonly MealProgramSummary[], id: string): boolean {
  return programs.find((program) => program.id === id)?.isPublished ?? false;
}
