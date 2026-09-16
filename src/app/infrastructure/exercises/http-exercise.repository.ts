import { Injectable, inject } from '@angular/core';
import { Exercise } from '@domain/exercises/entities/exercise';
import { ExerciseDraft } from '@domain/exercises/exercise-draft';
import {
  ExerciseFilter,
  ExerciseRepository,
} from '@domain/exercises/repositories/exercise.repository';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { ApiClient } from '@infrastructure/api/api-client';
import { toPage, toPagedQuery } from '@infrastructure/api/paging.mapper';
import {
  deleteExercisesById,
  getExercises,
  getExercisesById,
  postExercises,
  postExercisesByIdActivate,
  postExercisesByIdDeactivate,
  putExercisesById,
} from '@infrastructure/api/generated';
import {
  equipmentTypes,
  genders,
  muscleGroups,
  toCreateExerciseRequest,
  toExercise,
} from './exercise.mapper';

@Injectable()
export class HttpExerciseRepository implements ExerciseRepository {
  private readonly apiClient = inject(ApiClient);

  async list(filter: ExerciseFilter, page: PageRequest): Promise<Page<Exercise>> {
    const list = await this.apiClient.invoke(getExercises, {
      ...toPagedQuery(page),
      ...toFilterQuery(filter),
    });
    return toPage(list, toExercise);
  }

  async getById(id: string): Promise<Exercise> {
    return toExercise(await this.apiClient.invoke(getExercisesById, { id }));
  }

  create(draft: ExerciseDraft): Promise<string> {
    return this.apiClient.invoke(postExercises, { body: toCreateExerciseRequest(draft) });
  }

  async update(id: string, draft: ExerciseDraft): Promise<void> {
    await this.apiClient.invoke(putExercisesById, { id, body: toCreateExerciseRequest(draft) });
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.invoke(deleteExercisesById, { id });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const activation = isActive ? postExercisesByIdActivate : postExercisesByIdDeactivate;
    await this.apiClient.invoke(activation, { id });
  }
}

/** Only the filters the admin actually set are sent, so the backend applies its own defaults. */
function toFilterQuery(filter: ExerciseFilter): Record<string, string | number | boolean> {
  return {
    ...(filter.search === undefined || filter.search.length === 0 ? {} : { Search: filter.search }),
    ...(filter.muscleGroup === undefined
      ? {}
      : { MuscleGroup: muscleGroups.toApi(filter.muscleGroup) }),
    ...(filter.equipmentType === undefined
      ? {}
      : { EquipmentType: equipmentTypes.toApi(filter.equipmentType) }),
    ...(filter.gender === undefined ? {} : { Gender: genders.toApi(filter.gender) }),
    ...(filter.isHomeExercise === undefined ? {} : { IsHomeExercise: filter.isHomeExercise }),
    ...(filter.isActive === undefined ? {} : { IsActive: filter.isActive }),
  };
}
