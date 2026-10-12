import { FoodSource, ServingUnit } from './food-attributes';
import { LocalizedText } from '@shared/models/localized-text';

export interface NutritionPer100Grams {
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbsGrams: number;
  readonly fatGrams: number;
}

export class Food {
  constructor(
    readonly id: string,
    readonly names: LocalizedText,
    readonly source: FoodSource,
    readonly servingUnit: ServingUnit,
    readonly servingSize: number,
    readonly servingSizeGrams: number,
    readonly caloriesPerServing: number,
    readonly proteinGrams: number,
    readonly carbsGrams: number,
    readonly fatGrams: number,
    readonly isVerified: boolean,
    readonly isActive: boolean,
    readonly barcode: string | null = null,
    readonly fiberGrams: number | null = null,
  ) {}

  get per100Grams(): NutritionPer100Grams | null {
    if (this.servingSizeGrams <= 0) {
      return null;
    }
    const factor = 100 / this.servingSizeGrams;
    return {
      calories: this.caloriesPerServing * factor,
      proteinGrams: this.proteinGrams * factor,
      carbsGrams: this.carbsGrams * factor,
      fatGrams: this.fatGrams * factor,
    };
  }

  hasBarcode(): boolean {
    return this.barcode !== null;
  }
}
