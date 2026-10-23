import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { Client } from '@coach/core/clients/client';
import { toClient } from '@coach/core/clients/client.mapper';
import { ClientSummaryResponse, AdherenceResponse } from '@coach/core/clients/client.dto';
import { toAdherence } from '@coach/core/clients/client.mapper';
import { Payment } from '@coach/core/payments/payment';
import { EarningPaymentResponse } from '@coach/core/payments/payment.dto';
import { toPayment } from '@coach/core/payments/payment.mapper';
import { ClientProfile, DailyNutrition, SessionSummary } from '../models/client-detail';
import {
  ClientProfileResponse,
  DailyNutritionResponse,
  SessionSummaryResponse,
} from './client-detail.dto';
import {
  toClientProfile,
  toDailyNutrition,
  toIsoDate,
  toSessionSummary,
} from './client-detail.mapper';
import { Adherence } from '@coach/core/clients/client';

const CLIENTS = '/coach/clients';
const RECENT_SESSIONS = 3;
const PAYMENTS = 20;

@Injectable({ providedIn: 'root' })
export class ClientDetailService {
  private readonly api = inject(ApiClient);

  async findClient(userId: string): Promise<Client | null> {
    const summaries = await this.api.get<ClientSummaryResponse[]>(CLIENTS);
    const summary = summaries.find((item) => item.userId === userId);
    return summary === undefined ? null : toClient(summary, null);
  }

  async profile(userId: string): Promise<ClientProfile> {
    const response = await this.api.get<ClientProfileResponse>(this.path(userId));
    return toClientProfile(response, (path) => this.api.url(path));
  }

  async adherence(userId: string): Promise<Adherence> {
    return toAdherence(await this.api.get<AdherenceResponse>(`${this.path(userId)}/adherence`));
  }

  async recentSessions(userId: string): Promise<SessionSummary[]> {
    const page = await this.api.get<PagedList<SessionSummaryResponse>>(
      `${this.path(userId)}/workout-sessions`,
      {
        First: 0,
        Rows: RECENT_SESSIONS,
        SortField: 'started_on_utc',
        SortOrder: -1,
      },
    );
    return page.data.map(toSessionSummary);
  }

  async todayNutrition(userId: string, today: Date): Promise<DailyNutrition | null> {
    const day = toIsoDate(today);
    const days = await this.api.get<DailyNutritionResponse[]>(`${this.path(userId)}/nutrition`, {
      FromDate: day,
      ToDate: day,
    });
    const last = days.at(-1);
    return last === undefined ? null : toDailyNutrition(last);
  }

  async payments(userId: string): Promise<Payment[]> {
    const page = await this.api.get<PagedList<EarningPaymentResponse>>(
      `${this.path(userId)}/payments`,
      {
        First: 0,
        Rows: PAYMENTS,
        SortField: 'paid_on_utc',
        SortOrder: -1,
      },
    );
    return page.data.map(toPayment);
  }

  private path(userId: string): string {
    return `${CLIENTS}/${encodeURIComponent(userId)}`;
  }
}
