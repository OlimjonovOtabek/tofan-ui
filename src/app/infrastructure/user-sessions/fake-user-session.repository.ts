import { Injectable } from '@angular/core';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { UserSession } from '@domain/user-sessions/entities/user-session';
import { UserSessionRepository } from '@domain/user-sessions/repositories/user-session.repository';

const NETWORK_DELAY_MS = 250;
const DAY_MS = 24 * 60 * 60 * 1000;
/** The staging realm issues 90-day access tokens. */
const TOKEN_LIFETIME_MS = 90 * DAY_MS;

const TRAINEE_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const OTHER_TRAINEE_ID = '9b2f7c1e-4d8a-4f3b-a6e5-1c0d2b3a4f5e';

function login(id: string, userId: string, daysAgo: number, revokedDaysAgo?: number): UserSession {
  const loggedInAt = new Date(Date.now() - daysAgo * DAY_MS);
  return new UserSession(
    id,
    userId,
    loggedInAt,
    new Date(loggedInAt.getTime() + TOKEN_LIFETIME_MS),
    revokedDaysAgo === undefined ? null : new Date(Date.now() - revokedDaysAgo * DAY_MS),
  );
}

/** Mock login journal: one of each status, so the page can be judged without a backend. */
@Injectable()
export class FakeUserSessionRepository implements UserSessionRepository {
  private readonly sessions = [
    login('11111111-aaaa-4aaa-8aaa-111111111111', TRAINEE_ID, 0.1),
    login('22222222-aaaa-4aaa-8aaa-222222222222', OTHER_TRAINEE_ID, 3),
    login('33333333-aaaa-4aaa-8aaa-333333333333', TRAINEE_ID, 20, 12),
    login('44444444-aaaa-4aaa-8aaa-444444444444', OTHER_TRAINEE_ID, 120),
  ];

  async list(page: PageRequest): Promise<Page<UserSession>> {
    await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
    const direction = page.sortDirection === 'desc' ? -1 : 1;
    const key = (session: UserSession): number =>
      page.sortField === 'expiresOnUtc'
        ? session.expiresAt.getTime()
        : session.loggedInAt.getTime();
    const sorted = [...this.sessions].sort((a, b) => (key(a) - key(b)) * direction);
    return {
      items: sorted.slice(page.first, page.first + page.rows),
      totalCount: sorted.length,
    };
  }
}
