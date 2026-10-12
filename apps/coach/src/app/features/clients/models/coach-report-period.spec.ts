import { addDays, matchingPeriod, periodRange, toIsoDate } from './coach-report-period';

const now = new Date(2026, 9, 11, 15, 30);

describe('coach report period', () => {
  it('should format a local date as an ISO day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('should move across a month boundary when days are subtracted', () => {
    expect(addDays('2026-10-02', -3)).toBe('2026-09-29');
  });

  it('should include today when a period of several days is built', () => {
    expect(periodRange(7, now)).toEqual({ from: '2026-10-05', to: '2026-10-11' });
  });

  it('should recognise a preset when the range ends today with that length', () => {
    expect(matchingPeriod({ from: '2026-09-28', to: '2026-10-11' }, now)).toBe(14);
  });

  it('should report no preset when the range is custom', () => {
    expect(matchingPeriod({ from: '2026-10-01', to: '2026-10-09' }, now)).toBeNull();
  });
});
