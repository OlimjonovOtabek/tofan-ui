import { fromUtcCalendarDate, isAfterDay, startOfDay, toUtcCalendarDate } from './calendar-date';

describe('calendar date', () => {
  it('should send the picked day as UTC midnight when the local time is late', () => {
    expect(toUtcCalendarDate(new Date(2026, 7, 14, 23, 30))).toBe('2026-08-14T00:00:00.000Z');
  });

  it('should keep the same day when a UTC midnight comes back', () => {
    const date = fromUtcCalendarDate('2026-08-14T00:00:00Z');

    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 7, 14, 0,
    ]);
  });

  it('should drop the time when taking the start of the day', () => {
    expect(startOfDay(new Date(2026, 8, 23, 17, 5))).toEqual(new Date(2026, 8, 23));
  });

  it('should compare days only when checking the order', () => {
    const today = new Date(2026, 8, 23, 9, 0);

    expect(isAfterDay(new Date(2026, 8, 23, 23, 59), today)).toBe(false);
    expect(isAfterDay(new Date(2026, 8, 24), today)).toBe(true);
  });
});
