import { interpolate, lookupText } from './translation-lookup';

describe('lookupText', () => {
  const tree = { a: { b: 'leaf' }, c: 'top' };

  it('should find a nested text when the path exists', () => {
    expect(lookupText(tree, 'a.b')).toBe('leaf');
    expect(lookupText(tree, 'c')).toBe('top');
  });

  it('should return undefined when the path is missing or points to a branch', () => {
    expect(lookupText(tree, 'a.x')).toBeUndefined();
    expect(lookupText(tree, 'a')).toBeUndefined();
    expect(lookupText(tree, 'c.d')).toBeUndefined();
  });
});

describe('interpolate', () => {
  it('should replace every known placeholder when parameters are given', () => {
    expect(interpolate('{n} of {n}, {total}', { n: 2, total: 'ten' })).toBe('2 of 2, ten');
  });

  it('should keep a placeholder when its parameter is missing', () => {
    expect(interpolate('{first}-{last}', { first: 1 })).toBe('1-{last}');
  });

  it('should pick the plural category of the locale when the text has a plural block', () => {
    const text =
      '{count, plural, one{{count} день} few{{count} дня} many{{count} дней} other{{count} дня}}';

    expect(interpolate(text, { count: 1 }, 'ru-RU')).toBe('1 день');
    expect(interpolate(text, { count: 3 }, 'ru-RU')).toBe('3 дня');
    expect(interpolate(text, { count: 11 }, 'ru-RU')).toBe('11 дней');
  });

  it('should prefer an exact match when the plural block has one', () => {
    const text = 'Total · {count, plural, =0{none} one{1 item} other{{count} items}}';

    expect(interpolate(text, { count: 0 }, 'en-GB')).toBe('Total · none');
    expect(interpolate(text, { count: 1 }, 'en-GB')).toBe('Total · 1 item');
    expect(interpolate(text, { count: 7 }, 'en-GB')).toBe('Total · 7 items');
  });

  it('should fall back to the other branch when the locale category is missing', () => {
    expect(interpolate('{count, plural, other{{count} kun}}', { count: 5 }, 'uz-UZ')).toBe('5 kun');
  });

  it('should keep a plural block when its parameter is not a number', () => {
    const text = '{count, plural, other{{count} days}}';

    expect(interpolate(text, {}, 'en-GB')).toBe(text);
  });
});
