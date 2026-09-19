import { formatDate, formatDateTime } from './date-format';

describe('date format', () => {
  const date = new Date(2026, 8, 14, 19, 35);

  it('should use digits only when the locale is Uzbek', () => {
    expect(formatDateTime(date, 'uz')).not.toMatch(/M09/);
    expect(formatDate(date, 'uz')).toMatch(/14/);
  });

  it('should show the time when a date and time is formatted', () => {
    expect(formatDateTime(date, 'ru')).toContain('19:35');
    expect(formatDateTime(date, 'en')).toContain('19:35');
  });

  it('should put the day first when the locale is English', () => {
    expect(formatDate(date, 'en')).toBe('14/09/2026');
  });
});
