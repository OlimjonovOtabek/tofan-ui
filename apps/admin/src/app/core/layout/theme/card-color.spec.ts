import { TINT_NAMES, cardColorFor, groundSwatchFor } from './card-color';

describe('cardColorFor', () => {
  it('should return null when no card color is chosen', () => {
    expect(cardColorFor(null, false)).toBeNull();
  });

  it('should return null when the name is unknown', () => {
    expect(cardColorFor('unknown', false)).toBeNull();
  });

  it('should lighten the light ground when the theme is light', () => {
    expect(cardColorFor('blue', false)).toBe('color-mix(in srgb, #e0e7f5, #ffffff 55%)');
  });

  it('should lift the dark ground when the theme is dark', () => {
    expect(cardColorFor('blue', true)).toBe('color-mix(in srgb, #000c23, #ffffff 7%)');
  });
});

describe('groundSwatchFor', () => {
  it('should return the top ground color when the theme is light', () => {
    expect(groundSwatchFor('green', false)).toBe('#e0f5e1');
  });

  it('should return the dark ground color when the theme is dark', () => {
    expect(groundSwatchFor('green', true)).toBe('#00231b');
  });

  it('should return null when the name is unknown', () => {
    expect(groundSwatchFor('unknown', true)).toBeNull();
  });
});

describe('TINT_NAMES', () => {
  it('should offer every ground palette when listing tints', () => {
    expect(TINT_NAMES).toContain('noir');
    expect(TINT_NAMES).toContain('indigo');
  });
});
