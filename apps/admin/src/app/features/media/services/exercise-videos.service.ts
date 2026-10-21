import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { ExerciseChoice } from '../models/exercise-choice';
import { ExerciseResponse } from './exercise-video.dto';
import {
  hasNoVideo,
  toExerciseChoice,
  toSignedVideoUrls,
  toVideoUpdateRequest,
} from './exercise-video.mapper';

const EXERCISES = '/exercises';
const BATCH_SIZE = 1000;
const VIDEO_ALREADY_ATTACHED = 'Exercise.VideoAlreadyAttached';

@Injectable({ providedIn: 'root' })
export class ExerciseVideosService {
  private readonly apiClient = inject(ApiClient);

  async listWithoutVideo(): Promise<ExerciseChoice[]> {
    const exercises = await this.readCatalog();
    return exercises.filter(hasNoVideo).map(toExerciseChoice);
  }

  async listSignedVideoUrls(): Promise<ReadonlyMap<string, string>> {
    const exercises = await this.readCatalog();
    return toSignedVideoUrls(exercises, (path) => this.apiClient.url(path));
  }

  async attachVideo(exerciseId: string, videoFileId: string): Promise<void> {
    const path = `${EXERCISES}/${encodeURIComponent(exerciseId)}`;
    const exercise = await this.apiClient.get<ExerciseResponse>(path);
    if (!hasNoVideo(exercise)) {
      throw new ConflictError('The exercise already has a video.', VIDEO_ALREADY_ATTACHED);
    }
    await this.apiClient.put(path, toVideoUpdateRequest(exercise, videoFileId));
  }

  private async readCatalog(): Promise<ExerciseResponse[]> {
    const exercises: ExerciseResponse[] = [];
    for (let first = 0; ; first += BATCH_SIZE) {
      const page = await this.apiClient.get<PagedList<ExerciseResponse>>(EXERCISES, {
        ...toPagedQuery({ first, rows: BATCH_SIZE, sortField: 'nameUz', sortDirection: 'asc' }),
      });
      exercises.push(...page.data);
      if (page.data.length === 0 || first + BATCH_SIZE >= page.totalCount) {
        return exercises;
      }
    }
  }
}
