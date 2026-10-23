import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Dashboard } from '../models/dashboard';
import { DashboardResponse } from './dashboard.dto';
import { toDashboard } from './dashboard.mapper';

const DASHBOARD = '/coach/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  async get(): Promise<Dashboard> {
    return toDashboard(await this.api.get<DashboardResponse>(DASHBOARD));
  }
}
