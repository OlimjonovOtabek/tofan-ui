import { AuthSession } from '@domain/auth/entities/auth-session';
import { Roles } from '@domain/auth/roles';
import { toAuthSession, toUserProfile } from './auth.mapper';

/** Builds a token whose payload carries the given claims; the signature is never checked here. */
function tokenWith(claims: Record<string, unknown>): string {
  const payload = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(claims))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('auth mapper', () => {
  it('derives both expiry dates from the token lifetimes', () => {
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

  it('reads the profile from the Keycloak claims of the access token', () => {
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

  it('falls back to the username and no roles when claims are missing', () => {
    const user = toUserProfile(
      new AuthSession(tokenWith({ preferred_username: 'admin' }), new Date('2030-01-01')),
    );

    expect(user.fullName).toBe('admin');
    expect(user.isAdmin()).toBe(false);
  });

  it('survives a token that is not a JWT at all', () => {
    const user = toUserProfile(new AuthSession('not-a-token', new Date('2030-01-01')));

    expect(user.username).toBe('');
    expect(user.roles).toEqual([]);
  });
});
