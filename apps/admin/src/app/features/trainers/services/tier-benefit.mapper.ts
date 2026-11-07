import { Benefit } from '@shared/models/benefit';
import { TIERS } from '@shared/models/tier';
import { tiers } from '@shared/models/tier.dto';
import { TierBenefits } from '../models/tier-benefits';
import { BenefitText, ChangeTierBenefitsRequest, TierBenefitsResponse } from './tier-benefit.dto';

export function toTierBenefits(responses: readonly TierBenefitsResponse[]): TierBenefits[] {
  return TIERS.map((tier) => {
    const response = responses.find((candidate) => tiers.toDomainOrNull(candidate.tier) === tier);
    return { tier, benefits: (response?.benefits ?? []).map(toBenefit) };
  });
}

export function toChangeTierBenefitsRequest(
  benefits: readonly Benefit[],
): ChangeTierBenefitsRequest {
  return { benefits: benefits.map(toBenefitText) };
}

function toBenefit(text: BenefitText): Benefit {
  return { en: text.name, ru: text.nameRu, uz: text.nameUz };
}

function toBenefitText(benefit: Benefit): BenefitText {
  return { name: benefit.en, nameRu: benefit.ru, nameUz: benefit.uz };
}
