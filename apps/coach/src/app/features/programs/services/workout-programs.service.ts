import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { DayDraft } from '../models/day-draft';
import { WorkoutProgram, WorkoutProgramDetail } from '../models/workout-program';
import { WorkoutProgramForm } from '../models/workout-program-form';
import { WorkoutProgramDetailResponse, WorkoutProgramResponse } from './program.dto';
import {
  toCreateWorkoutProgramRequest,
  toDayRequest,
  toUpdateWorkoutProgramRequest,
  toWorkoutProgram,
  toWorkoutProgramDetail,
} from './workout-program.mapper';

const PROGRAMS = '/coach/workout-programs';

@Injectable({ providedIn: 'root' })
export class WorkoutProgramsService {
  private readonly api = inject(ApiClient);

  async list(): Promise<WorkoutProgram[]> {
    return (await this.api.get<WorkoutProgramResponse[]>(PROGRAMS)).map(toWorkoutProgram);
  }

  async get(id: string): Promise<WorkoutProgramDetail> {
    const response = await this.api.get<WorkoutProgramDetailResponse>(programPath(id));
    return toWorkoutProgramDetail(response, (path) => (path ? this.api.url(path) : null));
  }

  create(form: WorkoutProgramForm, days: readonly DayDraft[]): Promise<string> {
    return this.api.post<string>(PROGRAMS, toCreateWorkoutProgramRequest(form, days));
  }

  async update(id: string, form: WorkoutProgramForm): Promise<void> {
    await this.api.put(programPath(id), toUpdateWorkoutProgramRequest(form));
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

  addDay(id: string, day: DayDraft): Promise<string> {
    return this.api.post<string>(`${programPath(id)}/days`, toDayRequest(day));
  }

  async updateDay(id: string, dayId: string, day: DayDraft): Promise<void> {
    await this.api.put(`${programPath(id)}/days/${encodeURIComponent(dayId)}`, toDayRequest(day));
  }

  async deleteDay(id: string, dayId: string): Promise<void> {
    await this.api.delete(`${programPath(id)}/days/${encodeURIComponent(dayId)}`);
  }

  async reorderDays(id: string, dayIds: readonly string[]): Promise<void> {
    await this.api.put(`${programPath(id)}/days/order`, { dayIds });
  }
}

function programPath(id: string): string {
  return `${PROGRAMS}/${encodeURIComponent(id)}`;
}
