import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { CoachExerciseDraft } from '../models/coach-exercise';
import { toCoachExerciseRequest } from './coach-exercise.mapper';

const COACH_EXERCISES = '/coach/exercises';

@Injectable({ providedIn: 'root' })
export class CoachExercisesService {
  private readonly api = inject(ApiClient);

  create(draft: CoachExerciseDraft): Promise<string> {
    return this.api.post<string>(COACH_EXERCISES, toCoachExerciseRequest(draft));
  }

  async update(id: string, draft: CoachExerciseDraft): Promise<void> {
    await this.api.put(`${COACH_EXERCISES}/${encodeURIComponent(id)}`, toCoachExerciseRequest(draft));
  }
}
