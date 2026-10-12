import { ValidationError } from '@shared/models/errors/validation.error';
import { requireBarcode } from './barcode';

describe('requireBarcode', () => {
  it('should trim the barcode when it has surrounding spaces', () => {
    expect(requireBarcode('  4780016470016 ')).toBe('4780016470016');
  });

  it('should reject the barcode when it is blank', () => {
    expect(() => requireBarcode('   ')).toThrow(ValidationError);
  });
});
