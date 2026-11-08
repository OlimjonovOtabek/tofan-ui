import { formatNumber } from './number-format';

const NBSP = ' ';

describe('formatNumber', () => {
  it('should group thousands with a no-break space when the locale is Uzbek', () => {
    expect(formatNumber(1234567, 'uz')).toBe(`1${NBSP}234${NBSP}567`);
  });

  it('should use a comma as the decimal mark when the locale is Uzbek', () => {
    expect(formatNumber(2.5, 'uz')).toBe('2,5');
  });

  it('should keep the requested fraction digits when they are given', () => {
    expect(formatNumber(1000.456, 'uz', 2)).toBe(`1${NBSP}000,46`);
    expect(formatNumber(3, 'en', 2, 2)).toBe('3.00');
  });

  it('should use the browser locale data when the locale is English or Russian', () => {
    expect(formatNumber(200000, 'en')).toBe('200,000');
    expect(formatNumber(200000, 'ru')).toBe(new Intl.NumberFormat('ru-RU').format(200000));
  });
});
