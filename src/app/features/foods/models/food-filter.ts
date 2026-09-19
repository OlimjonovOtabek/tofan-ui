import { FoodSource } from './food-attributes';

export interface FoodFilter {
  readonly search?: string;
  readonly source?: FoodSource;
  readonly isActive: boolean;
  readonly isVerified?: boolean;
}

export const DEFAULT_FOOD_FILTER: FoodFilter = { isActive: true };
