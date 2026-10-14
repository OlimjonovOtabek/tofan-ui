import { AuthSession } from './auth-session';
import { Roles } from './roles';
import { toAuthSession, toUserProfile } from './auth.mapper';

function tokenWith(claims: Record<string, unknown>): string {
  const payload = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(claims))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('auth mapper', () => {
  it('should derive both expiry dates when mapping the token lifetimes', () => {
    const issuedAt = new Date('2026-01-01T12:00:00Z');

    const session = toAuthSession(
      {
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshExpiresIn: 7200,
      },
      issuedAt,
    );

    expect(session.accessToken).toBe('token');
    expect(session.refreshToken).toBe('refresh');
    expect(session.expiresAt.toISOString()).toBe('2026-01-01T13:00:00.000Z');
    expect(session.refreshExpiresAt?.toISOString()).toBe('2026-01-01T14:00:00.000Z');
  });

  it('should read the profile when the access token carries Keycloak claims', () => {
    const token = tokenWith({
      sub: '7',
      preferred_username: 'admin',
      name: 'Jahongir Esonov',
      realm_access: { roles: ['default-roles-tofan', Roles.admin] },
    });

    const user = toUserProfile(new AuthSession(token, new Date('2030-01-01')));

    expect(user.id).toBe('7');
    expect(user.username).toBe('admin');
    expect(user.fullName).toBe('Jahongir Esonov');
    expect(user.isAdmin()).toBe(true);
  });

  it('should fall back to the username and no roles when claims are missing', () => {
    const user = toUserProfile(
      new AuthSession(tokenWith({ preferred_username: 'admin' }), new Date('2030-01-01')),
    );

    expect(user.fullName).toBe('admin');
    expect(user.isAdmin()).toBe(false);
  });

  it('should return an empty profile when the token is not a JWT', () => {
    const user = toUserProfile(new AuthSession('not-a-token', new Date('2030-01-01')));

    expect(user.username).toBe('');
    expect(user.roles).toEqual([]);
  });
});
