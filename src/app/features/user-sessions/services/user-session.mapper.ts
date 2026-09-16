import { UserSession } from '../models/user-session';
import { UserSessionResponse } from './user-session.dto';

export function toUserSession(response: UserSessionResponse): UserSession {
  return new UserSession(
    response.id,
    response.userId,
    new Date(response.createdOnUtc),
    new Date(response.expiresOnUtc),
    response.isRevoked && response.revokedOnUtc ? new Date(response.revokedOnUtc) : null,
  );
}
