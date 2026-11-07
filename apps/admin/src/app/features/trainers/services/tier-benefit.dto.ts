import { TierDto } from '@shared/models/tier.dto';

export interface BenefitText {
  name: string;
  nameRu: string;
  nameUz: string;
}

export interface TierBenefitsResponse {
  tier: TierDto;
  benefits: BenefitText[];
}

export interface ChangeTierBenefitsRequest {
  benefits: BenefitText[];
}
