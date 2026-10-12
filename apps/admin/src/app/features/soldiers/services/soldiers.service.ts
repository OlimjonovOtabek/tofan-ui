import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList, Query } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Page, PageRequest } from '@shared/models/page';
import { SoldierFilter } from '../models/soldier-filter';
import { SoldierProfile } from '../models/soldier-profile';
import { SoldierSummary } from '../models/soldier-summary';
import { WeightEntry } from '../models/weight-entry';
import { SoldierListItemResponse, SoldierResponse, WeightLogResponse } from './soldier.dto';
import {
  experienceLevels,
  fitnessGoals,
  genders,
  toSoldierProfile,
  toSoldierSummary,
  toWeightEntry,
} from './soldier.mapper';

const SOLDIERS = '/admin/soldiers';
const PROFILE_NOT_FOUND = 'Profile.NotFound';

@Injectable({ providedIn: 'root' })
export class SoldiersService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: SoldierFilter, page: PageRequest): Promise<Page<SoldierSummary>> {
    const list = await this.apiClient.get<PagedList<SoldierListItemResponse>>(SOLDIERS, {
      ...toPagedQuery(page),
      ...toFilterQuery(filter),
    });
    return toPage(list, toSoldierSummary);
  }

  async findProfile(userId: string): Promise<SoldierProfile | null> {
    try {
      return toSoldierProfile(await this.apiClient.get<SoldierResponse>(soldierPath(userId)));
    } catch (error) {
      if (error instanceof NotFoundError && error.code === PROFILE_NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async weightHistory(userId: string): Promise<readonly WeightEntry[]> {
    const path = `${soldierPath(userId)}/weight-history`;
    const entries = await this.apiClient.get<WeightLogResponse[] | null>(path);
    return (entries ?? []).map(toWeightEntry);
  }
}

function soldierPath(userId: string): string {
  return `${SOLDIERS}/${encodeURIComponent(userId)}`;
}

function toFilterQuery(filter: SoldierFilter): Query {
  return {
    Search: filter.search === undefined || filter.search.length === 0 ? undefined : filter.search,
    Gender: filter.gender === undefined ? undefined : genders.toApi(filter.gender),
    Goal: filter.goal === undefined ? undefined : fitnessGoals.toApi(filter.goal),
    ExperienceLevel:
      filter.experienceLevel === undefined
        ? undefined
        : experienceLevels.toApi(filter.experienceLevel),
    IsHomeWorkout: filter.isHomeWorkout,
    CreatedFrom: filter.joinedFrom?.toISOString(),
    CreatedTo: filter.joinedBefore?.toISOString(),
  };
}
