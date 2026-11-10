import { STRONG_IDS, matteColor, strongColorFor, strongNameOf, withMatte } from './tone';

describe('strongNameOf', () => {
  it('should read the palette name when the id is a strong tone', () => {
    expect(strongNameOf('strong-blue')).toBe('blue');
  });

  it('should return null when the id is a pale tint or unknown', () => {
    expect(strongNameOf('blue')).toBeNull();
    expect(strongNameOf('strong-plaid')).toBeNull();
    expect(strongNameOf(null)).toBeNull();
  });
});

describe('strongColorFor', () => {
  it('should use the deep shade when the ground is strong in light mode', () => {
    expect(strongColorFor('strong-blue', 'ground', false)).toBe('#2563eb');
  });

  it('should use a readable light shade when the card is strong in light mode', () => {
    expect(strongColorFor('strong-blue', 'card', false)).toBe('#dbeafe');
  });

  it('should use the darkest shade when the theme is dark', () => {
    expect(strongColorFor('strong-blue', 'card', true)).toBe('#1e3a8a');
  });

  it('should take the zinc scale when the tone is noir', () => {
    expect(strongColorFor('strong-noir', 'ground', false)).toBe('#52525b');
  });

  it('should return null when the id is not a strong tone', () => {
    expect(strongColorFor('blue', 'ground', false)).toBeNull();
  });
});

describe('matte', () => {
  it('should keep the lightness and cut the chroma when a color is matte', () => {
    expect(matteColor('#2563eb')).toBe('oklch(from #2563eb l calc(c * 0.4) h)');
  });

  it('should leave the color unchanged when matte is off', () => {
    expect(withMatte('#2563eb', false)).toBe('#2563eb');
  });
});

describe('STRONG_IDS', () => {
  it('should offer noir and the sixteen primary colors when listing strong tones', () => {
    expect(STRONG_IDS).toHaveLength(17);
    expect(STRONG_IDS[0]).toBe('strong-noir');
  });
});
