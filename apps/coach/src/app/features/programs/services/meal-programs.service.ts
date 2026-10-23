import { Injectable, inject } from '@angular/core';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { Food } from '../models/food';
import { MealDraft } from '../models/meal-draft';
import { MealProgram, MealProgramDetail } from '../models/meal-program';
import { FoodResponse, MealProgramDetailResponse, MealProgramResponse } from './program.dto';
import {
  toFood,
  toMealProgram,
  toMealProgramDetail,
  toMealProgramRequest,
} from './meal-program.mapper';

const PROGRAMS = '/coach/meal-programs';
const FOODS = '/diet/foods';
const FOOD_PAGE_SIZE = 40;

@Injectable({ providedIn: 'root' })
export class MealProgramsService {
  private readonly api = inject(ApiClient);

  async list(): Promise<MealProgram[]> {
    return (await this.api.get<MealProgramResponse[]>(PROGRAMS)).map(toMealProgram);
  }

  async get(id: string): Promise<MealProgramDetail> {
    return toMealProgramDetail(await this.api.get<MealProgramDetailResponse>(programPath(id)));
  }

  create(name: string, goal: FitnessGoal | null, meals: readonly MealDraft[]): Promise<string> {
    return this.api.post<string>(PROGRAMS, toMealProgramRequest(name, goal, meals));
  }

  async update(
    id: string,
    name: string,
    goal: FitnessGoal | null,
    meals: readonly MealDraft[],
  ): Promise<void> {
    await this.api.put(programPath(id), toMealProgramRequest(name, goal, meals));
  }

  async publish(id: string): Promise<void> {
    await this.api.post(`${programPath(id)}/publish`);
  }

  async unpublish(id: string): Promise<void> {
    await this.api.post(`${programPath(id)}/unpublish`);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(programPath(id));
  }

  async searchFoods(query: string): Promise<Food[]> {
    const search = query.trim();
    const page = await this.api.get<PagedList<FoodResponse>>(FOODS, {
      Search: search === '' ? undefined : search,
      First: 0,
      Rows: FOOD_PAGE_SIZE,
      IsActive: true,
    });
    return page.data.map(toFood);
  }
}

function programPath(id: string): string {
  return `${PROGRAMS}/${encodeURIComponent(id)}`;
}
