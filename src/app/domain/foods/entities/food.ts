import { FoodSource, ServingUnit } from '../food-attributes';

/** Nutrition of a food, normalised to 100 grams. */
export interface NutritionPer100Grams {
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbsGrams: number;
  readonly fatGrams: number;
}

/** Catalog entry a trainee logs their meals from. Values are per serving, not per 100 g. */
export class Food {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly nameUz: string,
    readonly nameRu: string,
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

  /** What the panel shows in lists: the Uzbek name when it exists. */
  get displayName(): string {
    return this.nameUz.length > 0 ? this.nameUz : this.name;
  }

  /**
   * Comparable figures across foods with different serving sizes.
   * `null` when the serving weight is unknown, since there is nothing to divide by.
   */
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
