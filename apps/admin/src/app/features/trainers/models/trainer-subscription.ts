import { Tier } from '@shared/models/tier';
import { SubscriptionStatus } from './subscription-status';

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

  targetTier(): Tier {
    return this.tier === 'vip' ? 'standard' : 'vip';
  }
}
