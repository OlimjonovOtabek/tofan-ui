import { experienceLevels } from '@coach/core/fitness/experience-level.dto';
import { fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { toDateOrNull } from '@coach/core/payments/payment.mapper';
import {
  ClientProfile,
  DailyNutrition,
  SessionStatus,
  SessionSummary,
} from '../models/client-detail';
import {
  ClientProfileResponse,
  DailyNutritionResponse,
  SessionStatusDto,
  SessionSummaryResponse,
} from './client-detail.dto';

const SESSION_STATUSES: Readonly<Record<SessionStatusDto, SessionStatus>> = {
  [SessionStatusDto.Planned]: 'planned',
  [SessionStatusDto.Started]: 'started',
  [SessionStatusDto.Completed]: 'completed',
  [SessionStatusDto.Skipped]: 'skipped',
  [SessionStatusDto.Cancelled]: 'cancelled',
};

export function toClientProfile(
  response: ClientProfileResponse,
  photoUrlOf: (path: string) => string,
): ClientProfile {
  return {
    firstName: response.firstName ?? '',
    lastName: response.lastName ?? '',
    photoUrl: response.profilePhotoUrl ? photoUrlOf(response.profilePhotoUrl) : null,
    dateOfBirth: toDateOrNull(response.dateOfBirth),
    heightCm: response.heightCm,
    startingWeightKg: response.startingWeightKg,
    currentWeightKg: response.currentWeightKg,
    targetWeightKg: response.targetWeightKg,
    goal: response.goal === null ? null : fitnessGoals.toDomainOrNull(response.goal),
    experienceLevel:
      response.experienceLevel === null
        ? null
        : experienceLevels.toDomainOrNull(response.experienceLevel),
    isHomeWorkout: response.isHomeWorkout,
    workoutDaysPerWeek: response.workoutDaysPerWeek,
  };
}

export function toSessionSummary(response: SessionSummaryResponse): SessionSummary {
  return {
    id: response.id,
    title: response.planDayTitle ?? '',
    status: SESSION_STATUSES[response.status] ?? 'planned',
    startedOn: toDateOrNull(response.startedOnUtc),
    durationMinutes: response.durationMinutes ?? 0,
    caloriesBurned: response.estimatedCaloriesBurned ?? 0,
    completedSets: response.completedSetCount ?? 0,
    volumeKg: response.totalVolumeKg ?? 0,
  };
}

export function toDailyNutrition(response: DailyNutritionResponse): DailyNutrition {
  return { ...response };
}

export function toIsoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
