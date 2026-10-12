import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { CatalogFood, LibraryExercise, OwnFood } from './coach-program-library.dto';

const PAGE_SIZE = 25;
const OWN_EXERCISES = '/coach/exercises';
const EXERCISE_CATALOG = '/exercises';
const FOOD_CATALOG = '/diet/foods';
const OWN_FOODS = '/diet/custom-foods';

@Injectable({ providedIn: 'root' })
export class CoachProgramLibraryService {
  private readonly api = inject(ApiClient);

  listOwnExercises(search: string): Promise<readonly LibraryExercise[]> {
    return this.searchPage<LibraryExercise>(OWN_EXERCISES, search);
  }

  listExerciseCatalog(search: string): Promise<readonly LibraryExercise[]> {
    return this.searchPage<LibraryExercise>(EXERCISE_CATALOG, search);
  }

  listFoodCatalog(search: string): Promise<readonly CatalogFood[]> {
    return this.searchPage<CatalogFood>(FOOD_CATALOG, search);
  }

  listOwnFoods(): Promise<readonly OwnFood[]> {
    return this.api.get<OwnFood[]>(OWN_FOODS);
  }

  private async searchPage<T>(path: string, search: string): Promise<readonly T[]> {
    const response = await this.api.get<PagedList<T>>(path, {
      ...toPagedQuery({ first: 0, rows: PAGE_SIZE }),
      Search: search.length === 0 ? undefined : search,
    });
    return response.data ?? [];
  }
}
