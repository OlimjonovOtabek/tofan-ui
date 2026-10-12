import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { Page } from '@shared/models/page';
import {
  CoachAdherence,
  CoachClientProfile,
  CoachFoodLog,
  CoachWorkoutSession,
} from '../models/coach-client';
import { SessionStatus } from '../models/coach-session-status';
import {
  CoachAdherenceResponse,
  CoachClientProfileResponse,
  CoachDailyNutrition,
  CoachFoodLogResponse,
  CoachWeightPoint,
  CoachWorkoutSessionResponse,
} from './coach-client-detail.dto';
import {
  toCoachAdherence,
  toCoachClientProfile,
  toCoachFoodLog,
  toCoachWorkoutSession,
} from './coach-client.mapper';
import { sessionStatuses } from './coach-session-status.dto';

const CLIENTS = '/coach/clients';
const TIME_ZONE_HEADER = 'X-Time-Zone';
const SESSION_PAGE_SIZE = 20;
const WEIGHT_HISTORY_DAYS = 90;
const NUTRITION_DAYS = 7;
const ADHERENCE_DAYS = 30;

function reportHeaders(): HttpHeaders {
  return new HttpHeaders({
    [TIME_ZONE_HEADER]: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

function localDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localDateTime(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

@Injectable({ providedIn: 'root' })
export class CoachClientDetailService {
  private readonly api = inject(ApiClient);

  async getProfile(userId: string): Promise<CoachClientProfile> {
    const profile = await this.api.get<CoachClientProfileResponse>(`${clientPath(userId)}`);
    return toCoachClientProfile(profile);
  }

  async getWeightHistory(
    userId: string,
    from = localDateTime(WEIGHT_HISTORY_DAYS),
    to = new Date().toISOString(),
  ): Promise<readonly CoachWeightPoint[]> {
    return this.api.get(`${clientPath(userId)}/weight-history`, {
      From: from,
      To: to,
    }, reportHeaders());
  }

  async getSessions(
    userId: string,
    first = 0,
    fromDate?: string,
    toDate?: string,
    status?: SessionStatus,
  ): Promise<Page<CoachWorkoutSession>> {
    const response = await this.api.get<PagedList<CoachWorkoutSessionResponse>>(
      `${clientPath(userId)}/workout-sessions`,
      {
        ...toPagedQuery({ first, rows: SESSION_PAGE_SIZE }),
        FromDate: fromDate,
        ToDate: toDate,
        Status: status === undefined ? undefined : sessionStatuses.toApi(status),
      },
      reportHeaders(),
    );
    return toPage(response, toCoachWorkoutSession);
  }

  async getAdherence(
    userId: string,
    fromDate = localDate(ADHERENCE_DAYS),
    toDate = localDate(0),
  ): Promise<CoachAdherence> {
    const adherence = await this.api.get<CoachAdherenceResponse>(
      `${clientPath(userId)}/adherence`,
      { FromDate: fromDate, ToDate: toDate },
      reportHeaders(),
    );
    return toCoachAdherence(adherence);
  }

  getNutrition(
    userId: string,
    fromDate = localDate(NUTRITION_DAYS - 1),
    toDate = localDate(0),
  ): Promise<readonly CoachDailyNutrition[]> {
    return this.api.get(`${clientPath(userId)}/nutrition`, {
      FromDate: fromDate,
      ToDate: toDate,
    }, reportHeaders());
  }

  async getFoodLogs(userId: string, date: string): Promise<readonly CoachFoodLog[]> {
    const logs = await this.api.get<readonly CoachFoodLogResponse[]>(
      `${clientPath(userId)}/food-logs`,
      { date },
      reportHeaders(),
    );
    return logs.map(toCoachFoodLog);
  }
}

function clientPath(userId: string): string {
  return `${CLIENTS}/${encodeURIComponent(userId)}`;
}
