import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { TrainerAccount } from '../models/trainer-account';
import { TrainerAccountResponse } from './trainer-account.dto';
import { toTrainerAccount } from './trainer-account.mapper';

const USERS = '/admin/users';

@Injectable({ providedIn: 'root' })
export class TrainerAccountsService {
  private readonly apiClient = inject(ApiClient);

  async get(userId: string): Promise<TrainerAccount> {
    const response = await this.apiClient.get<TrainerAccountResponse>(
      `${USERS}/${encodeURIComponent(userId)}`,
    );
    return toTrainerAccount(response);
  }
}
