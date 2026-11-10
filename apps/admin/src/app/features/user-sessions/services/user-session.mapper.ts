import { Query } from '@core/http/api.dto';
import { enumMap } from '@shared/utils/enum-map';
import { UserSession } from '../models/user-session';
import { SessionStatusFilter, UserSessionFilter } from '../models/user-session-filter';
import { UserSessionResponse, UserSessionStatusDto } from './user-session.dto';

const statuses = enumMap<SessionStatusFilter, UserSessionStatusDto>(UserSessionStatusDto);

export function toUserSession(response: UserSessionResponse): UserSession {
  return new UserSession(
    response.id,
    response.userId,
    new Date(response.createdOnUtc),
    new Date(response.expiresOnUtc),
    response.isRevoked && response.revokedOnUtc ? new Date(response.revokedOnUtc) : null,
    response.userName ?? null,
    response.ipAddress ?? null,
    response.userAgent ?? null,
  );
}

export function toUserSessionQuery(filter: UserSessionFilter): Query {
  return {
    UserId: filter.userId,
    Search: filter.search,
    Status: filter.status === undefined ? undefined : statuses.toApi(filter.status),
    CreatedFrom: filter.loggedInFrom?.toISOString(),
    CreatedTo: filter.loggedInBefore?.toISOString(),
  };
}
