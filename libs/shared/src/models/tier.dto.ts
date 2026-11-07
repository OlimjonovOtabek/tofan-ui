import { enumMap } from '@shared/utils/enum-map';
import { Tier } from './tier';

export enum TierDto {
  Standard = 1,
  Vip = 2,
}

export const tiers = enumMap<Tier, TierDto>(TierDto);
