import { ExperienceLevel } from '@coach/core/fitness/experience-level';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { Adherence, Client } from '@coach/core/clients/client';
import { Payment } from '@coach/core/payments/payment';

export interface ClientProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly photoUrl: string | null;
  readonly dateOfBirth: Date | null;
  readonly heightCm: number | null;
  readonly startingWeightKg: number | null;
  readonly currentWeightKg: number | null;
  readonly targetWeightKg: number | null;
  readonly goal: FitnessGoal | null;
  readonly experienceLevel: ExperienceLevel | null;
  readonly isHomeWorkout: boolean | null;
  readonly workoutDaysPerWeek: number | null;
}

export type SessionStatus = 'planned' | 'started' | 'completed' | 'skipped' | 'cancelled';

export interface SessionSummary {
  readonly id: string;
  readonly title: string;
  readonly status: SessionStatus;
  readonly startedOn: Date | null;
  readonly durationMinutes: number;
  readonly caloriesBurned: number;
  readonly completedSets: number;
  readonly volumeKg: number;
}

export interface DailyNutrition {
  readonly consumedCalories: number;
  readonly targetCalories: number;
  readonly proteinGrams: number;
  readonly carbsGrams: number;
  readonly fatGrams: number;
  readonly targetProteinGrams: number;
  readonly targetCarbsGrams: number;
  readonly targetFatGrams: number;
  readonly mealsLogged: number;
}

export interface ClientDetail {
  readonly client: Client;
  readonly profile: ClientProfile;
  readonly adherence: Adherence | null;
  readonly sessions: readonly SessionSummary[] | null;
  readonly nutrition: DailyNutrition | null;
  readonly nutritionLoaded: boolean;
  readonly payments: readonly Payment[] | null;
}

export function weightChangeKg(profile: ClientProfile): number | null {
  const { startingWeightKg: start, currentWeightKg: current } = profile;
  return start === null || current === null ? null : current - start;
}

export function weightProgress(profile: ClientProfile): number | null {
  const { startingWeightKg: start, currentWeightKg: current, targetWeightKg: target } = profile;
  if (start === null || current === null || target === null || start === target) {
    return null;
  }
  return Math.min(Math.max((start - current) / (start - target), 0), 1);
}

export function completionProgress(adherence: Adherence | null): number | null {
  if (adherence === null || adherence.scheduledDays === 0) {
    return null;
  }
  return Math.min(adherence.completedDays / adherence.scheduledDays, 1);
}

export function calorieIntakePercent(nutrition: DailyNutrition | null): number | null {
  if (nutrition === null || nutrition.targetCalories === 0) {
    return null;
  }
  return Math.round((nutrition.consumedCalories / nutrition.targetCalories) * 100);
}

export function ageOf(dateOfBirth: Date, now: Date): number {
  const beforeBirthday =
    now.getMonth() < dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() && now.getDate() < dateOfBirth.getDate());
  return now.getFullYear() - dateOfBirth.getFullYear() - (beforeBirthday ? 1 : 0);
}
