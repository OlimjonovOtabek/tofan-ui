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
});
