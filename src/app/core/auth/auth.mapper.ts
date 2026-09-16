import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import type { AuthTokenResponse } from './auth.dto';
import { decodeJwtPayload } from './jwt';

const MILLISECONDS_IN_SECOND = 1000;

export function toAuthSession(
  response: AuthTokenResponse,
  issuedAt: Date = new Date(),
): AuthSession {
  return new AuthSession(
    response.accessToken,
    addSeconds(issuedAt, response.expiresIn),
    response.refreshToken,
    addSeconds(issuedAt, response.refreshExpiresIn),
  );
}

export function toUserProfile(session: AuthSession): UserProfile {
  const claims = decodeJwtPayload(session.accessToken) ?? {};
  const username = readString(claims['preferred_username']) ?? '';

  return new UserProfile(
    readString(claims['sub']) ?? '',
    username,
    readString(claims['name']) ?? username,
    readRealmRoles(claims),
  );
}

function addSeconds(moment: Date, seconds: number): Date {
  return new Date(moment.getTime() + seconds * MILLISECONDS_IN_SECOND);
}

function readRealmRoles(claims: Record<string, unknown>): readonly string[] {
  const realmAccess = claims['realm_access'];
  if (typeof realmAccess !== 'object' || realmAccess === null) {
    return [];
  }

  const roles = (realmAccess as Record<string, unknown>)['roles'];
  return Array.isArray(roles) ? roles.filter((role) => typeof role === 'string') : [];
}

function readString(claim: unknown): string | null {
  return typeof claim === 'string' && claim.length > 0 ? claim : null;
}
