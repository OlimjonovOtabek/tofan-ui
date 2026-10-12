import { ValidationError } from '@shared/models/errors/validation.error';

export const MIN_EXTENSION_MONTHS = 1;
export const MAX_EXTENSION_MONTHS = 24;

export function ensureExtensionMonths(months: number): number {
  if (!Number.isInteger(months) || months < MIN_EXTENSION_MONTHS || months > MAX_EXTENSION_MONTHS) {
    throw new ValidationError('The extension is out of range.', [
      {
        code: 'Garment.MonthsOutOfRange',
        message: `Months must be between ${MIN_EXTENSION_MONTHS} and ${MAX_EXTENSION_MONTHS}.`,
      },
    ]);
  }
  return months;
}
