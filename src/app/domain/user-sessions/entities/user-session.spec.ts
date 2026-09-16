import { UserSession } from './user-session';

describe('UserSession', () => {
  const loggedInAt = new Date('2026-09-01T09:00:00Z');
  const expiresAt = new Date('2026-11-30T09:00:00Z');

  it('is unexpired until its access token expires', () => {
    const session = new UserSession('1', 'user', loggedInAt, expiresAt, null);

    expect(session.status(new Date('2026-11-30T08:59:59Z'))).toBe('unexpired');
    expect(session.status(expiresAt)).toBe('expired');
  });

  it('reports a logout from every device over expiry', () => {
    const session = new UserSession(
      '1',
      'user',
      loggedInAt,
      expiresAt,
      new Date('2026-09-02T09:00:00Z'),
    );

    expect(session.status(new Date('2026-12-31T00:00:00Z'))).toBe('revokedEverywhere');
  });
});
