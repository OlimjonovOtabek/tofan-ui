import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { MealType } from '@coach/core/fitness/meal-type';
import { SessionStatus } from './coach-session-status';

export interface CoachClientSummary {
  userId: string;
  firstName: string;
  lastName: string;
  goal: FitnessGoal | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  subscribedOnUtc: string;
  subscriptionEndsOnUtc: string;
}

export interface CoachClientProfile {
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
  goal: FitnessGoal | null;
  goalTargetDate: string | null;
}

export interface CoachWorkoutSession {
  id: string;
  planDayTitle: string;
  status: SessionStatus;
  startedOnUtc: string;
  completedOnUtc: string | null;
  durationMinutes: number;
  estimatedCaloriesBurned: number;
  exerciseCount: number;
  completedSetCount: number;
  totalVolumeKg: number;
}

export interface CoachAdherenceDay {
  date: string;
  isRestDay: boolean;
  isMissed: boolean;
  sessionStatus: SessionStatus | null;
}

export interface CoachAdherence {
  fromDate: string;
  toDate: string;
  scheduledDays: number;
  completedDays: number;
  missedDays: number;
  restDays: number;
  adherencePercent: number;
  days: readonly CoachAdherenceDay[];
}

export interface CoachFoodLog {
  id: string;
  foodId: string;
  foodName: string;
  foodNameRu: string;
  foodNameUz: string;
  mealType: MealType;
  quantityGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  loggedOnUtc: string;
}
