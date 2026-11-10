import { Tier } from '@shared/models/tier';
import { SubscriptionStatus } from './subscription-status';

export type SubscriptionSource = 'paid' | 'granted';

export class TrainerSubscription {
  constructor(
    readonly id: string,
    readonly trainerId: string,
    readonly trainerDisplayName: string,
    readonly userId: string,
    readonly startsOn: Date,
    readonly endsOn: Date,
    readonly endedOn: Date | null,
    readonly grantedBy: string,
    readonly createdOn: Date,
    readonly tier: Tier,
    readonly userFullName: string | null,
    readonly userName: string | null,
    readonly isPaid: boolean,
  ) {}

  status(now: Date): SubscriptionStatus {
    return this.endedOn === null && this.endsOn.getTime() > now.getTime() ? 'active' : 'ended';
  }

  canEnd(now: Date): boolean {
    return this.status(now) === 'active';
  }

  canChangeTier(now: Date): boolean {
    return this.status(now) === 'active';
  }

  source(): SubscriptionSource {
    return this.isPaid ? 'paid' : 'granted';
  }

  targetTier(): Tier {
    return this.tier === 'vip' ? 'standard' : 'vip';
  }
}
