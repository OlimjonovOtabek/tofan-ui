import { isValidCommissionAmount, isValidPercent } from './platform-fee-rules';

describe('isValidCommissionAmount', () => {
  it.each([0, 1, 50000, 50000.5, 12.25])(
    'should accept %s when it is zero or more with at most two decimals',
    (amount) => {
      expect(isValidCommissionAmount(amount)).toBe(true);
    },
  );

  it.each([-0.01, -1, 12.255, 0.001, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject %s when it is negative or too precise',
    (amount) => {
      expect(isValidCommissionAmount(amount)).toBe(false);
    },
  );
});

describe('isValidPercent', () => {
  it.each([0, 2, 7.5, 12.25, 99.99, 100])(
    'should accept %s when it is within 0 to 100 with at most two decimals',
    (percent) => {
      expect(isValidPercent(percent)).toBe(true);
    },
  );

  it.each([-0.01, 100.01, 101, 12.255, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject %s when it is out of range or too precise',
    (percent) => {
      expect(isValidPercent(percent)).toBe(false);
    },
  );
});
