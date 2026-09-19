import { formatDate, formatDateTime } from './date-format';

describe('Date Format', () => {
  const date = new Date('2026-09-14T19:35:00Z');

  it('should format date for uz', () => {
    // using timeZone UTC to avoid local timezone issues in test
    const formatted = formatDate(date, 'uz', { timeZone: 'UTC' });
    expect(formatted).toContain('09');
    expect(formatted).toContain('14');
  });

  it('should format datetime for ru', () => {
    const formatted = formatDateTime(date, 'ru', { timeZone: 'UTC' });
    expect(formatted).toContain('19:35');
  });
});
