import { UserSession } from '@domain/user-sessions/entities/user-session';
import { UserSessionResponse } from '@infrastructure/api/generated';

/** The access token hash is left out on purpose: it identifies a credential and tells an admin nothing. */
export function toUserSession(response: UserSessionResponse): UserSession {
  return new UserSession(
    response.id,
    response.userId,
    new Date(response.createdOnUtc),
    new Date(response.expiresOnUtc),
    response.isRevoked && response.revokedOnUtc ? new Date(response.revokedOnUtc) : null,
  );
}
