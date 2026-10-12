import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';

export enum GenderDto {
  Male = 1,
  Female = 2,
}

export interface CoachClientSummaryResponse {
  userId: string;
  firstName: string;
  lastName: string;
  gender?: GenderDto | null;
  goal?: FitnessGoalDto | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  subscribedOnUtc: string;
  subscriptionEndsOnUtc: string;
}
