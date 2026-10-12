import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { MealTypeDto } from '@coach/core/fitness/meal-type.dto';
import { WorkoutSessionStatusDto } from './coach-session-status.dto';

export interface CoachClientProfileResponse {
  profileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  profilePhotoUrl: string | null;
  timeZone: string;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  goal: FitnessGoalDto | null;
  goalTargetDate: string | null;
}

export interface CoachWeightPoint {
  id: string;
  weightKg: number;
  loggedDate: string;
  loggedOnUtc: string;
  note: string | null;
}

export interface CoachWorkoutSessionResponse {
  id: string;
  planDayTitle: string;
  status: WorkoutSessionStatusDto;
  startedOnUtc: string;
  completedOnUtc: string | null;
  durationMinutes: number;
  estimatedCaloriesBurned: number;
  exerciseCount: number;
  completedSetCount: number;
  totalVolumeKg: number;
}

export interface CoachAdherenceDayResponse {
  date: string;
  dayOfWeek: number;
  isRestDay: boolean;
  isMissed: boolean;
  sessionStatus: WorkoutSessionStatusDto | null;
}

export interface CoachAdherenceResponse {
  fromDate: string;
  toDate: string;
  scheduledDays: number;
  completedDays: number;
  missedDays: number;
  restDays: number;
  adherencePercent: number;
  days: readonly CoachAdherenceDayResponse[];
}

export interface CoachDailyNutrition {
  date: string;
  consumedCalories: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  mealsLogged: number;
}

export interface CoachFoodLogResponse {
  id: string;
  foodId: string;
  foodName: string;
  foodNameRu: string;
  foodNameUz: string;
  mealType: MealTypeDto;
  quantityGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  loggedOnUtc: string;
}
