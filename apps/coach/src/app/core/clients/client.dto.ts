import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { TierDto } from '@shared/models/tier.dto';

export enum ClientSubscriptionStatusDto {
  Active = 1,
  Expiring = 2,
  Ended = 3,
}

export interface ClientSummaryResponse {
  userId: string;
  firstName: string;
  lastName: string;
  goal: FitnessGoalDto | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  subscribedOnUtc: string | null;
  subscriptionEndsOnUtc: string | null;
  status: ClientSubscriptionStatusDto;
  lastWorkoutOnUtc: string | null;
  tier: TierDto;
}

export interface AdherenceResponse {
  scheduledDays: number;
  completedDays: number;
  missedDays: number;
  adherencePercent: number;
}
