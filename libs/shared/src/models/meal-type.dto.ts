import { enumMap } from '@shared/utils/enum-map';
import { MealType } from './meal-type';

export enum MealTypeDto {
  Breakfast = 1,
  Lunch = 2,
  Dinner = 3,
  Snack = 4,
  PreWorkout = 5,
  PostWorkout = 6,
  SecondBreakfast = 7,
}

export const mealTypes = enumMap<MealType, MealTypeDto>(MealTypeDto);
