import { ExperienceLevelDto } from '@coach/core/fitness/experience-level.dto';
import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';

export interface ClientProfileResponse {
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  dateOfBirth: string | null;
  heightCm: number | null;
  startingWeightKg: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  goal: FitnessGoalDto | null;
  experienceLevel: ExperienceLevelDto | null;
  isHomeWorkout: boolean | null;
  workoutDaysPerWeek: number | null;
}

export enum SessionStatusDto {
  Planned = 1,
  Started = 2,
  Completed = 3,
  Skipped = 4,
  Cancelled = 5,
}

export interface SessionSummaryResponse {
  id: string;
  planDayTitle: string | null;
  status: SessionStatusDto;
  startedOnUtc: string | null;
  durationMinutes: number | null;
  estimatedCaloriesBurned: number | null;
  completedSetCount: number | null;
  totalVolumeKg: number | null;
}

export interface DailyNutritionResponse {
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
