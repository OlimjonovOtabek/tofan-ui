import { ValidationError } from '@shared/models/errors/validation.error';
import { isValidCommissionPercent, requireCommissionPercent } from './trainer-commission';

function issueCodes(percent: number): string[] {
  try {
    requireCommissionPercent(percent);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The percent was accepted.');
}

describe('isValidCommissionPercent', () => {
  it.each([0, 5, 7.5, 12.25, 100])(
    'should accept %s when it is within 0 to 100 with at most two decimals',
    (percent) => {
      expect(isValidCommissionPercent(percent)).toBe(true);
    },
  );

  it.each([-0.01, 100.01, 12.255, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject %s when it is out of range or too precise',
    (percent) => {
      expect(isValidCommissionPercent(percent)).toBe(false);
    },
  );
});

describe('requireCommissionPercent', () => {
  it('should return the percent when it is valid', () => {
    expect(requireCommissionPercent(7.5)).toBe(7.5);
  });

  it('should report the commission code when the percent is above 100', () => {
    expect(issueCodes(101)).toEqual(['Trainer.InvalidCommissionPercent']);
  });
});
