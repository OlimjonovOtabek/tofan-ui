import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const expiresAt = new Date('2026-01-01T12:00:00Z');
  const session = new AuthSession('token', expiresAt);

  it('is valid before the expiry moment', () => {
    expect(session.isExpired(new Date('2026-01-01T11:59:59Z'))).toBe(false);
  });

  it('is expired from the expiry moment on', () => {
    expect(session.isExpired(expiresAt)).toBe(true);
  });
});
