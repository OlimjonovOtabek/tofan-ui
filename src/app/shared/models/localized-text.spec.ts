import { pickLocalized } from './localized-text';

describe('pickLocalized', () => {
  const text = { en: 'Apple', uz: 'Olma', ru: 'Яблоко' };

  it('should return exact match', () => {
    expect(pickLocalized(text, 'uz')).toBe('Olma');
    expect(pickLocalized(text, 'ru')).toBe('Яблоко');
  });

  it('should fallback to uz if current is empty', () => {
    const partial = { en: 'Apple', uz: 'Olma', ru: '' };
    expect(pickLocalized(partial, 'ru')).toBe('Olma');
  });

  it('should fallback to en if uz is empty', () => {
    const partial = { en: 'Apple', uz: '', ru: '' };
    expect(pickLocalized(partial, 'ru')).toBe('Apple');
  });

  it('should handle null/undefined', () => {
    expect(pickLocalized(null, 'uz')).toBe('');
    expect(pickLocalized(undefined, 'uz')).toBe('');
  });
});
