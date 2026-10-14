import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { CoachClientSummary } from '../models/coach-client';
import { CoachClientSummaryResponse } from './coach-client.dto';
import { toCoachClientSummary } from './coach-client.mapper';

@Injectable({ providedIn: 'root' })
export class CoachClientsService {
  private readonly api = inject(ApiClient);

  async list(): Promise<CoachClientSummary[]> {
    const clients = await this.api.get<CoachClientSummaryResponse[]>('/coach/clients');
    return clients.map(toCoachClientSummary);
  }
}
