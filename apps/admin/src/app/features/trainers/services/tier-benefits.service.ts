import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Benefit } from '@shared/models/benefit';
import { Tier } from '@shared/models/tier';
import { tiers } from '@shared/models/tier.dto';
import { TierBenefits } from '../models/tier-benefits';
import { TierBenefitsResponse } from './tier-benefit.dto';
import { toChangeTierBenefitsRequest, toTierBenefits } from './tier-benefit.mapper';

const PUBLIC_TIER_BENEFITS = '/public/trainer-tier-benefits';
const ADMIN_TIER_BENEFITS = '/admin/trainer-tier-benefits';

@Injectable({ providedIn: 'root' })
export class TierBenefitsService {
  private readonly apiClient = inject(ApiClient);

  async list(): Promise<TierBenefits[]> {
    const responses = await this.apiClient.get<TierBenefitsResponse[]>(PUBLIC_TIER_BENEFITS);
    return toTierBenefits(responses);
  }

  async change(tier: Tier, benefits: readonly Benefit[]): Promise<void> {
    await this.apiClient.put(
      `${ADMIN_TIER_BENEFITS}/${tiers.toApi(tier)}`,
      toChangeTierBenefitsRequest(benefits),
    );
  }
}
