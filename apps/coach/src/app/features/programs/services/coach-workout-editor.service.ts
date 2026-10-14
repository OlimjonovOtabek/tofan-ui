import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { WorkoutPlan } from '../models/coach-program';
import { CoachProgramsService } from './coach-programs.service';
import { toWorkoutPlan } from './coach-workout-program.mapper';
import {
  CreateWorkoutPlanDayRequest,
  UpdateWorkoutPlanDayRequest,
  WorkoutPlanDay,
  WorkoutPlanDetails,
} from './coach-program.dto';

const WORKOUT_PLANS = '/workout-plans';
const WORKOUT_PLAN_DAYS = '/workout-plan-days';
const DAY_PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class CoachWorkoutEditorService {
  private readonly api = inject(ApiClient);
  private readonly programs = inject(CoachProgramsService);

  async getPlan(id: string): Promise<WorkoutPlan> {
    const plan = await this.api.get<WorkoutPlanDetails>(`${WORKOUT_PLANS}/${encodeURIComponent(id)}`);
    return toWorkoutPlan(plan);
  }

  async getProgramPublished(id: string): Promise<boolean> {
    const programs = await this.programs.listWorkoutPrograms();
    return programs.find((program) => program.id === id)?.isPublished ?? false;
  }

  async listAllDays(): Promise<readonly WorkoutPlanDay[]> {
    let first = 0;
    let totalCount = 1;
    const days: WorkoutPlanDay[] = [];
    while (first < totalCount) {
      const page = await this.api.get<PagedList<WorkoutPlanDay>>(WORKOUT_PLAN_DAYS, {
        ...toPagedQuery({ first, rows: DAY_PAGE_SIZE }),
      });
      days.push(...(page.data ?? []));
      totalCount = page.totalCount ?? 0;
      first += page.data?.length ?? 0;
      if (page.data?.length === 0) {
        break;
      }
    }
    return days;
  }

  createDay(request: CreateWorkoutPlanDayRequest): Promise<string> {
    return this.api.post<string>(WORKOUT_PLAN_DAYS, request);
  }

  async updateDay(id: string, request: UpdateWorkoutPlanDayRequest): Promise<void> {
    await this.api.put(`${WORKOUT_PLAN_DAYS}/${encodeURIComponent(id)}`, request);
  }

  async deleteDay(id: string): Promise<void> {
    await this.api.delete(`${WORKOUT_PLAN_DAYS}/${encodeURIComponent(id)}`);
  }
}
