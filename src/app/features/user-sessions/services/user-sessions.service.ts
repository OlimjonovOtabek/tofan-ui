import { Injectable, inject } from '@angular/core';
import { Page, PageRequest } from '@shared/models/page';
import { UserSession } from '../models/user-session';
import { UserSessionFilter } from '../models/user-session-filter';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { UserSessionResponse } from './user-session.dto';
import { toUserSession } from './user-session.mapper';

@Injectable({ providedIn: 'root' })
export class UserSessionsService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: UserSessionFilter, page: PageRequest): Promise<Page<UserSession>> {
    const list = await this.apiClient.get<PagedList<UserSessionResponse>>('/user-sessions', {
      ...toPagedQuery(page),
      UserId: filter.userId,
    });
    return toPage(list, toUserSession);
  }
}
