import { Tier } from '@shared/models/tier';
import { SubscriptionStatus } from './subscription-status';

export const ENDING_SOON_DAYS = 7;

export interface SubscriptionFilter {
  readonly trainerId?: string;
  readonly search?: string;
  readonly status?: SubscriptionStatus;
  readonly tier?: Tier;
  readonly endingSoon?: boolean;
}

export interface EndingSoonWindow {
  readonly from: Date;
  readonly before: Date;
}

export function endingSoonWindow(now: Date): EndingSoonWindow {
  const before = new Date(now);
  before.setDate(before.getDate() + ENDING_SOON_DAYS);
  return { from: new Date(now), before };
}
