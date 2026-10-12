import { CoachAdherenceDay } from '../models/coach-client';
import { adherenceDayKind, mondayBasedWeekday } from './coach-adherence-days';

function day(overrides: Partial<CoachAdherenceDay>): CoachAdherenceDay {
  return { date: '2026-10-09', isRestDay: false, isMissed: false, sessionStatus: null, ...overrides };
}

describe('coach adherence days', () => {
  it('should treat a rest day as rest even when it is also flagged as missed', () => {
    expect(adherenceDayKind(day({ isRestDay: true, isMissed: true }))).toBe('rest');
  });

  it('should treat a missed day as missed', () => {
    expect(adherenceDayKind(day({ isMissed: true }))).toBe('missed');
  });

  it('should treat a day with a completed session as completed', () => {
    expect(adherenceDayKind(day({ sessionStatus: 'completed' }))).toBe('completed');
  });

  it('should treat a scheduled day without a completed session as planned', () => {
    expect(adherenceDayKind(day({ sessionStatus: null }))).toBe('planned');
  });

  it('should number Monday as the first weekday and Sunday as the last', () => {
    expect(mondayBasedWeekday('2026-09-28')).toBe(0);
    expect(mondayBasedWeekday('2026-10-11')).toBe(6);
  });
});
