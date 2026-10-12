import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { CoachExercise } from '../models/coach-exercise';
import { CoachExerciseResponse } from './coach-content.dto';
import { toCoachExercise } from './coach-exercise.mapper';

const PAGE_SIZE = 25;

@Injectable({ providedIn: 'root' })
export class CoachContentService {
  private readonly api = inject(ApiClient);

  async listExercises(search: string): Promise<readonly CoachExercise[]> {
    const response = await this.api.get<PagedList<CoachExerciseResponse>>('/coach/exercises', {
      ...toPagedQuery({ first: 0, rows: PAGE_SIZE }),
      Search: search.length === 0 ? undefined : search,
    });
    return (response.data ?? []).map(toCoachExercise);
  }
}
