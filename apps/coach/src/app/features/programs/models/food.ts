import { ServingUnit } from '@coach/core/fitness/serving-unit';
import { LocalizedText } from '@shared/models/localized-text';

export const DEFAULT_PORTION_GRAMS = 100;

export interface Food {
  readonly id: string;
  readonly name: LocalizedText;
  readonly servingUnit: ServingUnit;
  readonly servingSize: number | null;
  readonly servingSizeGrams: number | null;
  readonly caloriesPerServing: number | null;
}

export interface PickedFood {
  readonly food: Food;
  readonly quantity: number;
  readonly unit: ServingUnit;
  readonly estimatedCost: number | null;
}

export function unitsFor(food: Food): ServingUnit[] {
  const own = food.servingUnit;
  return own === 'grams' || own === 'milliliters' ? [own] : [own, 'grams'];
}

export function defaultQuantity(food: Food, unit: ServingUnit): number {
  if (unit === 'grams' && food.servingUnit !== 'grams') {
    return positiveOr(food.servingSizeGrams, DEFAULT_PORTION_GRAMS);
  }
  return positiveOr(food.servingSize, food.servingSizeGrams ?? DEFAULT_PORTION_GRAMS);
}

export function caloriesFor(food: Food, quantity: number, unit: ServingUnit): number | null {
  const calories = food.caloriesPerServing;
  if (calories === null) {
    return null;
  }
  const perServing =
    unit === food.servingUnit
      ? (food.servingSize ?? food.servingSizeGrams)
      : unit === 'grams'
        ? food.servingSizeGrams
        : null;
  if (perServing === null || perServing <= 0) {
    return null;
  }
  return Math.round((calories * quantity) / perServing);
}

export function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
}

export function parseQuantity(text: string): number | null {
  const value = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function positiveOr(value: number | null, fallback: number): number {
  return value !== null && value > 0 ? value : fallback;
}
