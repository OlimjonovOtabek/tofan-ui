export enum FoodSource {
  System = 1,
  UserCustom = 2,
  AiScan = 3,
  Imported = 4,
}

export enum ServingUnit {
  Grams = 1,
  Milliliters = 2,
  Piece = 3,
  Slice = 4,
  Cup = 5,
  Tablespoon = 6,
  Teaspoon = 7,
}

export interface FoodResponse {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  source: FoodSource;
  servingUnit: ServingUnit;
  servingSize: number;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number | null;
  barcode?: string | null;
  isVerified: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isMine: boolean;
}

export interface CreateFoodRequest {
  name: string;
  nameUz: string;
  nameRu: string;
  source: FoodSource;
  servingUnit: ServingUnit;
  servingSize: number;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number | null;
  barcode?: string | null;
  isVerified: boolean;
  isActive: boolean;
}
