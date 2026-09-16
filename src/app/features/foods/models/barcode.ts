import { ValidationError } from '@shared/models/errors/validation.error';

export function requireBarcode(barcode: string): string {
  const normalized = barcode.trim();
  if (normalized.length === 0) {
    throw new ValidationError('The barcode is required.', [
      { code: 'Barcode.Empty', message: 'Barcode is required.' },
    ]);
  }
  return normalized;
}
