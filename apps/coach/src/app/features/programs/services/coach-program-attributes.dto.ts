import { enumMap } from '@shared/utils/enum-map';
import { ExperienceLevel, Weekday, WorkoutSplit } from '../models/coach-program-attributes';

export enum FitnessExperienceLevelDto {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum DayOfWeekDto {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export enum WorkoutSplitTypeDto {
  FullBody = 1,
  UpperLower = 2,
  PushPullLegs = 3,
  BroSplit = 4,
  Cardio = 5,
  Mobility = 6,
  Custom = 7,
  Rest = 8,
}

export enum WorkoutPlanSourceDto {
  Ai = 1,
  Trainer = 2,
  User = 3,
  System = 4,
}

export enum FoodSourceDto {
  System = 1,
  UserCustom = 2,
  AiScan = 3,
  Imported = 4,
  Trainer = 5,
}

export enum ServingUnitDto {
  Grams = 1,
  Milliliters = 2,
  Piece = 3,
  Slice = 4,
  Cup = 5,
  Tablespoon = 6,
  Teaspoon = 7,
}

export const experienceLevels = enumMap<ExperienceLevel, FitnessExperienceLevelDto>(
  FitnessExperienceLevelDto,
);
export const weekdays = enumMap<Weekday, DayOfWeekDto>(DayOfWeekDto);
export const workoutSplits = enumMap<WorkoutSplit, WorkoutSplitTypeDto>(WorkoutSplitTypeDto);
