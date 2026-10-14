import { enumMap } from './enum-map';

enum ApiGender {
  Male = 1,
  Female = 2,
}

const genders = enumMap<'male' | 'female', ApiGender>(ApiGender);

describe('enumMap', () => {
  it('should convert both ways when the value is a member', () => {
    expect(genders.toDomain(ApiGender.Female)).toBe('female');
    expect(genders.toApi('male')).toBe(ApiGender.Male);
  });

  it('should throw when a strict conversion meets an unknown value', () => {
    expect(() => genders.toDomain(0 as ApiGender)).toThrow();
  });

  it('should give null when a tolerant conversion meets an unknown value', () => {
    expect(genders.toDomainOrNull(0 as ApiGender)).toBeNull();
    expect(genders.toDomainOrNull(ApiGender.Male)).toBe('male');
  });
});
