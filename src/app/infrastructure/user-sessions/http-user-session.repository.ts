import { Injectable, inject } from '@angular/core';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { UserSession } from '@domain/user-sessions/entities/user-session';
import { UserSessionRepository } from '@domain/user-sessions/repositories/user-session.repository';
import { ApiClient } from '@infrastructure/api/api-client';
import { getUserSessions } from '@infrastructure/api/generated';
import { toPage, toPagedQuery } from '@infrastructure/api/paging.mapper';
import { toUserSession } from './user-session.mapper';

@Injectable()
export class HttpUserSessionRepository implements UserSessionRepository {
  private readonly apiClient = inject(ApiClient);

  async list(page: PageRequest): Promise<Page<UserSession>> {
    return toPage(await this.apiClient.invoke(getUserSessions, toPagedQuery(page)), toUserSession);
  }
}
