import { toDayPeriod } from './day-range';

describe('toDayPeriod', () => {
  it('should return an empty period when no day is picked', () => {
    expect(toDayPeriod(null)).toEqual({});
    expect(toDayPeriod([])).toEqual({});
  });

  it('should cover the whole day when only one day is picked', () => {
    expect(toDayPeriod([new Date(2026, 10, 9, 15, 30)])).toEqual({
      from: new Date(2026, 10, 9),
      before: new Date(2026, 10, 10),
    });
  });

  it('should end after the last day when a range is picked', () => {
    expect(toDayPeriod([new Date(2026, 10, 1), new Date(2026, 10, 30)])).toEqual({
      from: new Date(2026, 10, 1),
      before: new Date(2026, 11, 1),
    });
  });

  it('should treat the first day as the last when the range is still open', () => {
    expect(toDayPeriod([new Date(2026, 0, 31), null])).toEqual({
      from: new Date(2026, 0, 31),
      before: new Date(2026, 1, 1),
    });
  });
});
