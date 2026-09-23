import { ValidationError } from '@shared/models/errors/validation.error';
import { ensureExtensionMonths } from './garment-extension';

describe('ensureExtensionMonths', () => {
  it('should accept the months when they are within the backend range', () => {
    expect(ensureExtensionMonths(1)).toBe(1);
    expect(ensureExtensionMonths(24)).toBe(24);
  });

  it('should reject the months when they are outside the range or fractional', () => {
    expect(() => ensureExtensionMonths(0)).toThrow(ValidationError);
    expect(() => ensureExtensionMonths(25)).toThrow(ValidationError);
    expect(() => ensureExtensionMonths(1.5)).toThrow(ValidationError);
  });
});
