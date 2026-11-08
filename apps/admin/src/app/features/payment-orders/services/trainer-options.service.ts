import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { firstPage } from '@shared/models/page';
import { TRAINER_OPTIONS_LIMIT, TrainerOption } from '../models/trainer-option';
import { TrainerOptionResponse } from './trainer-option.dto';
import { toTrainerOption } from './trainer-option.mapper';

const TRAINERS = '/admin/trainers';

@Injectable({ providedIn: 'root' })
export class TrainerOptionsService {
  private readonly apiClient = inject(ApiClient);

  async list(): Promise<readonly TrainerOption[]> {
    const list = await this.apiClient.get<PagedList<TrainerOptionResponse>>(
      TRAINERS,
      toPagedQuery(firstPage(TRAINER_OPTIONS_LIMIT)),
    );
    return (list.data ?? []).map(toTrainerOption);
  }
}
