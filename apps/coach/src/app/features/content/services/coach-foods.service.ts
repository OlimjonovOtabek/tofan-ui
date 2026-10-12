import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { CoachFoodRequest, CoachFoodSummary } from './coach-content.dto';

const CUSTOM_FOODS = '/diet/custom-foods';
const COACH_FOODS = '/coach/foods';

@Injectable({ providedIn: 'root' })
export class CoachFoodsService {
  private readonly api = inject(ApiClient);

  list(): Promise<CoachFoodSummary[]> {
    return this.api.get<CoachFoodSummary[]>(CUSTOM_FOODS);
  }

  create(request: CoachFoodRequest): Promise<string> {
    return this.api.post<string>(COACH_FOODS, request);
  }

  async update(id: string, request: CoachFoodRequest): Promise<void> {
    await this.api.put(`${CUSTOM_FOODS}/${encodeURIComponent(id)}`, request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${CUSTOM_FOODS}/${encodeURIComponent(id)}`);
  }
}
