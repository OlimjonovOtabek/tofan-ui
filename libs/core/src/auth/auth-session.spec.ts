import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const expiresAt = new Date('2026-01-01T12:00:00Z');
  const refreshExpiresAt = new Date('2026-01-01T18:00:00Z');
  const session = new AuthSession('token', expiresAt, 'refresh', refreshExpiresAt);

  it('should not be expired when the expiry moment has not come', () => {
    expect(session.isExpired(new Date('2026-01-01T11:59:59Z'))).toBe(false);
  });

  it('should be expired when the expiry moment is reached', () => {
    expect(session.isExpired(expiresAt)).toBe(true);
  });

  it('should be renewable when the refresh token is still alive', () => {
    expect(session.canBeRenewed(expiresAt)).toBe(true);
    expect(session.canBeRenewed(refreshExpiresAt)).toBe(false);
  });

  it('should not be renewable when there is no refresh token', () => {
    expect(new AuthSession('token', expiresAt).canBeRenewed(expiresAt)).toBe(false);
  });

  it('should stay usable when it can still be renewed', () => {
    expect(session.isUsable(expiresAt)).toBe(true);
    expect(session.isUsable(refreshExpiresAt)).toBe(false);
  });
});
