import { fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { tiers } from '@shared/models/tier.dto';
import { toDateOrNull } from '../payments/payment.mapper';
import {
  AdherenceResponse,
  ClientSubscriptionStatusDto,
  ClientSummaryResponse,
} from './client.dto';
import { Adherence, Client, SubscriptionStatus } from './client';

const STATUSES: Readonly<Record<ClientSubscriptionStatusDto, SubscriptionStatus>> = {
  [ClientSubscriptionStatusDto.Active]: 'active',
  [ClientSubscriptionStatusDto.Expiring]: 'expiring',
  [ClientSubscriptionStatusDto.Ended]: 'ended',
};

export function toClient(response: ClientSummaryResponse, adherencePercent: number | null): Client {
  return {
    userId: response.userId,
    firstName: response.firstName ?? '',
    lastName: response.lastName ?? '',
    goal: response.goal === null ? null : fitnessGoals.toDomainOrNull(response.goal),
    currentWeightKg: response.currentWeightKg,
    targetWeightKg: response.targetWeightKg,
    subscribedOn: toDateOrNull(response.subscribedOnUtc),
    subscriptionEndsOn: toDateOrNull(response.subscriptionEndsOnUtc),
    status: STATUSES[response.status] ?? 'active',
    tier: tiers.toDomainOrNull(response.tier) ?? 'standard',
    lastWorkoutOn: toDateOrNull(response.lastWorkoutOnUtc),
    adherencePercent,
  };
}

export function toAdherence(response: AdherenceResponse): Adherence {
  return {
    scheduledDays: response.scheduledDays,
    completedDays: response.completedDays,
    missedDays: response.missedDays,
    percent: response.adherencePercent,
  };
}
