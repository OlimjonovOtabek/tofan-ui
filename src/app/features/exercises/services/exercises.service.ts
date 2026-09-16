import { Injectable, inject } from '@angular/core';
import { Exercise } from '../models/exercise';
import { ExerciseDraft } from '../models/exercise-draft';
import { ExerciseFilter } from '../models/exercise-filter';
import { Page, PageRequest } from '@shared/models/page';
import { ApiClient } from '@core/http/api-client';
import { PagedList, Query } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { ExerciseResponse } from './exercise.dto';
import {
  equipmentTypes,
  genders,
  muscleGroups,
  toCreateExerciseRequest,
  toExercise,
} from './exercise.mapper';

const EXERCISES = '/exercises';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: ExerciseFilter, page: PageRequest): Promise<Page<Exercise>> {
    const list = await this.apiClient.get<PagedList<ExerciseResponse>>(EXERCISES, {
      ...toPagedQuery(page),
      ...toFilterQuery(filter),
    });
    return toPage(list, toExercise);
  }

  async getById(id: string): Promise<Exercise> {
    return toExercise(await this.apiClient.get<ExerciseResponse>(exercisePath(id)));
  }

  create(draft: ExerciseDraft): Promise<string> {
    return this.apiClient.post<string>(EXERCISES, toCreateExerciseRequest(draft));
  }

  async update(id: string, draft: ExerciseDraft): Promise<void> {
    await this.apiClient.put(exercisePath(id), toCreateExerciseRequest(draft));
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(exercisePath(id));
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const action = isActive ? 'activate' : 'deactivate';
    await this.apiClient.post(`${exercisePath(id)}/${action}`);
  }
}

function exercisePath(id: string): string {
  return `${EXERCISES}/${encodeURIComponent(id)}`;
}

function toFilterQuery(filter: ExerciseFilter): Query {
  return {
    Search: filter.search === undefined || filter.search.length === 0 ? undefined : filter.search,
    MuscleGroup:
      filter.muscleGroup === undefined ? undefined : muscleGroups.toApi(filter.muscleGroup),
    EquipmentType:
      filter.equipmentType === undefined ? undefined : equipmentTypes.toApi(filter.equipmentType),
    Gender: filter.gender === undefined ? undefined : genders.toApi(filter.gender),
    IsHomeExercise: filter.isHomeExercise,
    IsActive: filter.isActive,
  };
}
