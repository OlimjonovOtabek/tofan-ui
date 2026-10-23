import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { daysSinceWorkout, initialsOf } from './client-activity';
import { ClientFilter } from './client-filter';

export const HIGH_ADHERENCE = 85;
export const REVIEW_ADHERENCE = 70;
export const LOW_ACTIVITY_DAYS = 7;

export type SubscriptionStatus = 'active' | 'expiring' | 'ended';
export type AdherenceLevel = 'high' | 'good' | 'low';

export interface Client {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly goal: FitnessGoal | null;
  readonly currentWeightKg: number | null;
  readonly targetWeightKg: number | null;
  readonly subscribedOn: Date | null;
  readonly subscriptionEndsOn: Date | null;
  readonly status: SubscriptionStatus;
  readonly lastWorkoutOn: Date | null;
  readonly adherencePercent: number | null;
}

export interface Adherence {
  readonly scheduledDays: number;
  readonly completedDays: number;
  readonly missedDays: number;
  readonly percent: number;
}

export function fullNameOf(client: Pick<Client, 'firstName' | 'lastName'>): string {
  return `${client.firstName} ${client.lastName}`.trim();
}

export function initialsOfClient(client: Pick<Client, 'firstName' | 'lastName'>): string {
  return initialsOf(client.firstName, client.lastName);
}

export function adherenceLevel(percent: number | null): AdherenceLevel | null {
  if (percent === null) {
    return null;
  }
  if (percent >= HIGH_ADHERENCE) {
    return 'high';
  }
  return percent >= REVIEW_ADHERENCE ? 'good' : 'low';
}

export function needsReview(client: Client): boolean {
  return adherenceLevel(client.adherencePercent) === 'low';
}

export function isLowActivity(client: Client, now: Date): boolean {
  if (client.status === 'ended') {
    return false;
  }
  const days = daysSinceWorkout(client.lastWorkoutOn, now);
  return days === null || days >= LOW_ACTIVITY_DAYS;
}

export function daysLeft(client: Client, now: Date): number | null {
  const ends = client.subscriptionEndsOn;
  if (ends === null) {
    return null;
  }
  const hours = (ends.getTime() - now.getTime()) / 3_600_000;
  return hours <= 0 ? 0 : Math.ceil(hours / 24);
}

export function matchesFilter(client: Client, filter: ClientFilter, now: Date): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'active':
      return client.status !== 'ended';
    case 'expiring':
      return client.status === 'expiring';
    case 'lowActivity':
      return isLowActivity(client, now);
    case 'ended':
      return client.status === 'ended';
  }
}

export function filterClients(
  clients: readonly Client[],
  filter: ClientFilter,
  query: string,
  now: Date,
): Client[] {
  const needle = query.trim().toLowerCase();
  const matches = clients.filter(
    (client) =>
      matchesFilter(client, filter, now) &&
      (needle === '' || fullNameOf(client).toLowerCase().includes(needle)),
  );
  if (filter === 'lowActivity') {
    matches.sort(
      (a, b) =>
        (a.lastWorkoutOn?.getTime() ?? -Infinity) - (b.lastWorkoutOn?.getTime() ?? -Infinity),
    );
  }
  return matches;
}

export function countClients(clients: readonly Client[], filter: ClientFilter, now: Date): number {
  return clients.filter((client) => matchesFilter(client, filter, now)).length;
}
