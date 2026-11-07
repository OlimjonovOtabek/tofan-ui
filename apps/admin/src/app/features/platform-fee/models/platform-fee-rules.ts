export const COMMISSION_AMOUNT_MIN = 0;
export const PERCENT_MIN = 0;
export const PERCENT_MAX = 100;
export const PLATFORM_FEE_FRACTION_DIGITS = 2;

const FRACTION_SCALE = 10 ** PLATFORM_FEE_FRACTION_DIGITS;

export function isValidCommissionAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= COMMISSION_AMOUNT_MIN && hasLimitedFraction(amount);
}

export function isValidPercent(percent: number): boolean {
  return (
    Number.isFinite(percent) &&
    percent >= PERCENT_MIN &&
    percent <= PERCENT_MAX &&
    hasLimitedFraction(percent)
  );
}

function hasLimitedFraction(value: number): boolean {
  return Math.round(value * FRACTION_SCALE) / FRACTION_SCALE === value;
}
