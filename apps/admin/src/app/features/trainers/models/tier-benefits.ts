import { Benefit } from '@shared/models/benefit';
import { Tier } from '@shared/models/tier';

export interface TierBenefits {
  readonly tier: Tier;
  readonly benefits: readonly Benefit[];
}
