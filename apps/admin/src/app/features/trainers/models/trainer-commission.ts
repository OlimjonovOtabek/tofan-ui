import { ValidationError } from '@shared/models/errors/validation.error';

export const COMMISSION_PERCENT_MIN = 0;
export const COMMISSION_PERCENT_MAX = 100;
export const COMMISSION_PERCENT_FRACTION_DIGITS = 2;

const FRACTION_SCALE = 10 ** COMMISSION_PERCENT_FRACTION_DIGITS;

export function isValidCommissionPercent(percent: number): boolean {
  return (
    Number.isFinite(percent) &&
    percent >= COMMISSION_PERCENT_MIN &&
    percent <= COMMISSION_PERCENT_MAX &&
    Math.round(percent * FRACTION_SCALE) / FRACTION_SCALE === percent
  );
}

export function requireCommissionPercent(percent: number): number {
  if (!isValidCommissionPercent(percent)) {
    throw new ValidationError('The commission percent is out of range.', [
      { code: 'Trainer.InvalidCommissionPercent', message: 'The commission percent is not valid.' },
    ]);
  }
  return percent;
}
