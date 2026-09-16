import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const expiresAt = new Date('2026-01-01T12:00:00Z');
  const refreshExpiresAt = new Date('2026-01-01T18:00:00Z');
  const session = new AuthSession('token', expiresAt, 'refresh', refreshExpiresAt);

  it('is valid before the expiry moment', () => {
    expect(session.isExpired(new Date('2026-01-01T11:59:59Z'))).toBe(false);
  });

  it('is expired from the expiry moment on', () => {
    expect(session.isExpired(expiresAt)).toBe(true);
  });

  it('can be renewed while the refresh token lives', () => {
    expect(session.canBeRenewed(expiresAt)).toBe(true);
    expect(session.canBeRenewed(refreshExpiresAt)).toBe(false);
  });

  it('cannot be renewed without a refresh token', () => {
    expect(new AuthSession('token', expiresAt).canBeRenewed(expiresAt)).toBe(false);
  });

  it('stays usable while it can be renewed', () => {
    expect(session.isUsable(expiresAt)).toBe(true);
    expect(session.isUsable(refreshExpiresAt)).toBe(false);
  });
});
