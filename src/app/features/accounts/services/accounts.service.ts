import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList, Query } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { Page, PageRequest } from '@shared/models/page';
import { Account } from '../models/account';
import { AccountFilter } from '../models/account-filter';
import { UserResponse } from './account.dto';
import { toAccount } from './account.mapper';

const USERS = '/admin/users';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: AccountFilter, page: PageRequest): Promise<Page<Account>> {
    const list = await this.apiClient.get<PagedList<UserResponse>>(USERS, {
      ...toPagedQuery(page),
      ...toFilterQuery(filter),
    });
    return toPage(list, toAccount);
  }

  async getById(id: string): Promise<Account> {
    return toAccount(await this.apiClient.get<UserResponse>(userPath(id)));
  }

  async getRoles(id: string): Promise<readonly string[]> {
    return (await this.apiClient.get<string[] | null>(`${userPath(id)}/roles`)) ?? [];
  }

  async block(id: string): Promise<void> {
    await this.apiClient.post(`${userPath(id)}/block`);
  }

  async unblock(id: string): Promise<void> {
    await this.apiClient.post(`${userPath(id)}/unblock`);
  }

  async logoutEverywhere(id: string): Promise<void> {
    await this.apiClient.post(`${userPath(id)}/logout-all`);
  }
}

function userPath(id: string): string {
  return `${USERS}/${encodeURIComponent(id)}`;
}

function toFilterQuery(filter: AccountFilter): Query {
  return {
    Search: filter.search === undefined || filter.search.length === 0 ? undefined : filter.search,
    IsActive: filter.isActive,
    Role: filter.role,
  };
}
