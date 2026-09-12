import { toAuthSession, toUserProfile } from './auth.mapper';

describe('auth mapper', () => {
  it('derives the expiry date from the token lifetime', () => {
    const issuedAt = new Date('2026-01-01T12:00:00Z');

    const session = toAuthSession({ accessToken: 'token', expiresIn: 3600 }, issuedAt);

    expect(session.accessToken).toBe('token');
    expect(session.refreshToken).toBeNull();
    expect(session.expiresAt.toISOString()).toBe('2026-01-01T13:00:00.000Z');
  });

  it('maps the user profile', () => {
    const user = toUserProfile({ id: '7', username: 'admin', fullName: 'Admin', roles: ['ADMIN'] });

    expect(user.fullName).toBe('Admin');
    expect(user.hasRole('ADMIN')).toBe(true);
  });
});
