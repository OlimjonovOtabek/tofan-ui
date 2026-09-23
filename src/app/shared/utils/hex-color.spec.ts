import { isHexColor } from './hex-color';

describe('isHexColor', () => {
  it('should accept the code when it is a hash and six hex digits', () => {
    expect(isHexColor('#1A2b3C')).toBe(true);
  });

  it('should reject the code when the hash is missing or the length is wrong', () => {
    expect(isHexColor('1A2B3C')).toBe(false);
    expect(isHexColor('#1A2B3')).toBe(false);
    expect(isHexColor('#1A2B3CD')).toBe(false);
    expect(isHexColor('black')).toBe(false);
  });
});
