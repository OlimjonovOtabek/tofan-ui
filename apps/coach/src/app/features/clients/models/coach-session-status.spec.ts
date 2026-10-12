import { SESSION_STATUSES, sessionTone } from './coach-session-status';

describe('coach session status', () => {
  it('should mark only a completed session as good', () => {
    expect(SESSION_STATUSES.filter((status) => sessionTone(status) === 'good')).toEqual(['completed']);
  });

  it('should mark skipped and cancelled sessions as bad', () => {
    expect(SESSION_STATUSES.filter((status) => sessionTone(status) === 'bad')).toEqual(['skipped', 'cancelled']);
  });
});
