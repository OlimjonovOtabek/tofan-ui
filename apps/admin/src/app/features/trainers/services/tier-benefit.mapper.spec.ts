import { TierDto } from '@shared/models/tier.dto';
import { TierBenefitsResponse } from './tier-benefit.dto';
import { toChangeTierBenefitsRequest, toTierBenefits } from './tier-benefit.mapper';

const standard: TierBenefitsResponse = {
  tier: TierDto.Standard,
  benefits: [
    { name: 'Workout programs', nameRu: 'Программы тренировок', nameUz: 'Mashq dasturlari' },
    { name: 'Diet programs', nameRu: 'Программы питания', nameUz: 'Ovqatlanish dasturlari' },
  ],
};

const vip: TierBenefitsResponse = {
  tier: TierDto.Vip,
  benefits: [{ name: '1:1 chat', nameRu: 'Чат 1:1', nameUz: '1:1 chat' }],
};

describe('toTierBenefits', () => {
  it('should map the wire names to the three texts and keep the order', () => {
    const [first] = toTierBenefits([standard, vip]);

    expect(first.tier).toBe('standard');
    expect(first.benefits).toEqual([
      { en: 'Workout programs', ru: 'Программы тренировок', uz: 'Mashq dasturlari' },
      { en: 'Diet programs', ru: 'Программы питания', uz: 'Ovqatlanish dasturlari' },
    ]);
  });

  it('should list Standard before VIP when the backend answers in another order', () => {
    const tiers = toTierBenefits([vip, standard]);

    expect(tiers.map((entry) => entry.tier)).toEqual(['standard', 'vip']);
  });

  it('should give a tier an empty list when the backend does not return it', () => {
    const tiers = toTierBenefits([standard]);

    expect(tiers.map((entry) => entry.tier)).toEqual(['standard', 'vip']);
    expect(tiers[1].benefits).toEqual([]);
  });

  it('should skip a tier this panel does not know when the backend adds one', () => {
    const unknown: TierBenefitsResponse = { tier: 9 as TierDto, benefits: [] };

    const tiers = toTierBenefits([standard, vip, unknown]);

    expect(tiers.map((entry) => entry.tier)).toEqual(['standard', 'vip']);
  });
});

describe('toChangeTierBenefitsRequest', () => {
  it('should send the English text as name and keep the order', () => {
    const request = toChangeTierBenefitsRequest([
      { en: 'B', ru: 'Б', uz: 'Bb' },
      { en: 'A', ru: 'А', uz: 'Aa' },
    ]);

    expect(request).toEqual({
      benefits: [
        { name: 'B', nameRu: 'Б', nameUz: 'Bb' },
        { name: 'A', nameRu: 'А', nameUz: 'Aa' },
      ],
    });
  });

  it('should send an empty list when no benefits are left', () => {
    expect(toChangeTierBenefitsRequest([])).toEqual({ benefits: [] });
  });
});
