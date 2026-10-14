import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { mealProgramName } from '../models/coach-meal-program-name';
import {
  CreateMealProgramBody,
  CreateMealProgramRequest,
  MealProgramDetails,
  MealProgramSummary,
  UpdateMealProgramRequest,
  WorkoutProgramSummary,
} from './coach-program.dto';
import { NewWorkoutProgram, WorkoutProgram } from '../models/coach-program';
import { toCreateWorkoutProgramRequest, toWorkoutProgram } from './coach-workout-program.mapper';

@Injectable({ providedIn: 'root' })
export class CoachProgramsService {
  private readonly api = inject(ApiClient);

  async listWorkoutPrograms(): Promise<WorkoutProgram[]> {
    const programs = await this.api.get<WorkoutProgramSummary[]>('/coach/workout-programs');
    return programs.map(toWorkoutProgram);
  }

  listMealPrograms(): Promise<MealProgramSummary[]> {
    return this.api.get<MealProgramSummary[]>('/coach/meal-programs');
  }

  getMealPlan(id: string): Promise<MealProgramDetails> {
    return this.api.get(`/coach/meal-programs/${encodeURIComponent(id)}`);
  }

  async updateMealPlan(id: string, request: UpdateMealProgramRequest): Promise<void> {
    await this.api.put(`/coach/meal-programs/${encodeURIComponent(id)}`, request);
  }

  createWorkout(program: NewWorkoutProgram): Promise<string> {
    return this.api.post<string>('/coach/workout-programs', toCreateWorkoutProgramRequest(program));
  }

  createMeal(request: CreateMealProgramRequest): Promise<string> {
    return this.api.post<string>('/coach/meal-programs', toCreateMealProgramBody(request));
  }

  async publishWorkout(id: string): Promise<void> {
    await this.api.post(`/coach/workout-programs/${encodeURIComponent(id)}/publish`);
  }

  async publishMeal(id: string): Promise<void> {
    await this.api.post(`/coach/meal-programs/${encodeURIComponent(id)}/publish`);
  }
}

export function toCreateMealProgramBody(request: CreateMealProgramRequest): CreateMealProgramBody {
  return { ...request, name: mealProgramName(request.startDate, request.endDate) };
}
