import { daysSinceWorkout, initialsOf, lastWorkoutText } from './client-activity';
import { toClientFilter } from './client-filter';

const now = new Date(2026, 9, 22, 10, 0);

describe('lastWorkoutText', () => {
  it('should say there are no workouts when the client never trained', () => {
    expect(lastWorkoutText(null, now)).toEqual({ key: 'coachApp.activity.none' });
  });

  it('should name today and yesterday when the workout is recent', () => {
    expect(lastWorkoutText(new Date(2026, 9, 22, 7, 0), now).key).toBe('coachApp.activity.today');
    expect(lastWorkoutText(new Date(2026, 9, 21, 23, 0), now).key).toBe(
      'coachApp.activity.yesterday',
    );
  });

  it('should count the days when the workout is older', () => {
    expect(lastWorkoutText(new Date(2026, 9, 12), now)).toEqual({
      key: 'coachApp.activity.daysAgo',
      params: { days: 10 },
    });
  });
});

describe('daysSinceWorkout', () => {
  it('should never be negative when the clock of the client is ahead', () => {
    expect(daysSinceWorkout(new Date(2026, 9, 23), now)).toBe(0);
  });
});

describe('initialsOf', () => {
  it('should take the first letter of every non-empty part', () => {
    expect(initialsOf('aziz', '', null, 'karimov')).toBe('AK');
  });
});

describe('toClientFilter', () => {
  it('should fall back to active when the value is unknown', () => {
    expect(toClientFilter('expiring')).toBe('expiring');
    expect(toClientFilter('oops')).toBe('active');
  });
});
