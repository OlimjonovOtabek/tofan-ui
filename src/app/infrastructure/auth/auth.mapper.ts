import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { TokenResponse, UserProfileResponse } from '@infrastructure/api/generated';

const MILLISECONDS_IN_SECOND = 1000;

export function toAuthSession(response: TokenResponse, issuedAt: Date = new Date()): AuthSession {
  const expiresAt = new Date(issuedAt.getTime() + response.expiresIn * MILLISECONDS_IN_SECOND);
  return new AuthSession(response.accessToken, expiresAt, response.refreshToken ?? null);
}

export function toUserProfile(response: UserProfileResponse): UserProfile {
  return new UserProfile(response.id, response.username, response.fullName, response.roles);
}
