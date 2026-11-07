import { TIERS } from './tier';
import { TierDto, tiers } from './tier.dto';

describe('tiers enum map', () => {
  it('should map every tier when converting both ways', () => {
    for (const tier of TIERS) {
      expect(tiers.toDomain(tiers.toApi(tier))).toBe(tier);
    }
  });

  it('should send the backend integers when converting a tier to the API', () => {
    expect(tiers.toApi('standard')).toBe(1);
    expect(tiers.toApi('vip')).toBe(2);
  });

  it('should read the backend integers when converting from the API', () => {
    expect(tiers.toDomain(1)).toBe('standard');
    expect(tiers.toDomain(2)).toBe('vip');
  });

  it('should name the DTO members the way the backend does when exposing the enum', () => {
    expect(TierDto.Standard).toBe(1);
    expect(TierDto.Vip).toBe(2);
  });

  it('should return null when the lenient reader gets an unknown value', () => {
    expect(tiers.toDomainOrNull(0 as TierDto)).toBeNull();
    expect(tiers.toDomainOrNull(3 as TierDto)).toBeNull();
    expect(tiers.toDomainOrNull(undefined as never)).toBeNull();
  });

  it('should throw when the strict reader gets an unknown value', () => {
    expect(() => tiers.toDomain(0 as TierDto)).toThrow(/unknown enum value/);
    expect(() => tiers.toDomain(undefined as never)).toThrow(/unknown enum value/);
  });

  it('should throw when the domain value has no DTO member', () => {
    expect(() => tiers.toApi('platinum' as never)).toThrow(/DTO enum/);
  });
});
