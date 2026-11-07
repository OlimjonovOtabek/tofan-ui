export enum TariffType {
  Free = 1,
  Standard = 2,
  Vip = 3,
}

export enum MealType {
  Breakfast = 1,
  Lunch = 2,
  Dinner = 3,
  Snack = 4,
  PreWorkout = 5,
  PostWorkout = 6,
  SecondBreakfast = 7,
}

export interface TariffBenefitResponse {
  name: string;
  nameRu: string;
  nameUz: string;
}

export interface TariffResponse {
  id: string;
  type: TariffType;
  monthlyPrice: number;
  totalPrice: number;
  foodScanLimit: number | null;
  workoutVideoLimit: number | null;
  dietMealTypes: MealType[] | null;
  workoutChangeMonths: number | null;
  dietChangeDays: number | null;
  hasAiTrainerChat: boolean;
  benefits: TariffBenefitResponse[];
}

export interface ChangeTariffRequest {
  monthlyPrice: number;
  foodScanLimit: number | null;
  workoutVideoLimit: number | null;
  dietMealTypes: MealType[] | null;
  workoutChangeMonths: number | null;
  dietChangeDays: number | null;
  hasAiTrainerChat: boolean;
}

export interface ChangeTariffBenefitsRequest {
  benefits: TariffBenefitResponse[];
}
