import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { FitnessGoalDto, fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { mealTypes } from '@coach/core/fitness/meal-type.dto';
import {
  CoachAdherence,
  CoachClientProfile,
  CoachClientSummary,
  CoachFoodLog,
  CoachWorkoutSession,
} from '../models/coach-client';
import {
  CoachAdherenceResponse,
  CoachClientProfileResponse,
  CoachFoodLogResponse,
  CoachWorkoutSessionResponse,
} from './coach-client-detail.dto';
import { CoachClientSummaryResponse } from './coach-client.dto';
import { sessionStatuses } from './coach-session-status.dto';

export function toCoachClientSummary(response: CoachClientSummaryResponse): CoachClientSummary {
  return {
    userId: response.userId,
    firstName: response.firstName,
    lastName: response.lastName,
    goal: toGoal(response.goal),
    currentWeightKg: response.currentWeightKg ?? null,
    targetWeightKg: response.targetWeightKg ?? null,
    subscribedOnUtc: response.subscribedOnUtc,
    subscriptionEndsOnUtc: response.subscriptionEndsOnUtc,
  };
}

export function toCoachClientProfile(response: CoachClientProfileResponse): CoachClientProfile {
  return { ...response, goal: toGoal(response.goal) };
}

export function toCoachWorkoutSession(response: CoachWorkoutSessionResponse): CoachWorkoutSession {
  return { ...response, status: sessionStatuses.toDomain(response.status) };
}

export function toCoachAdherence(response: CoachAdherenceResponse): CoachAdherence {
  return {
    ...response,
    days: response.days.map((day) => ({
      date: day.date,
      isRestDay: day.isRestDay,
      isMissed: day.isMissed,
      sessionStatus: day.sessionStatus === null ? null : sessionStatuses.toDomain(day.sessionStatus),
    })),
  };
}

export function toCoachFoodLog(response: CoachFoodLogResponse): CoachFoodLog {
  return { ...response, mealType: mealTypes.toDomain(response.mealType) };
}

function toGoal(goal: FitnessGoalDto | null | undefined): FitnessGoal | null {
  return goal === null || goal === undefined ? null : fitnessGoals.toDomain(goal);
}
