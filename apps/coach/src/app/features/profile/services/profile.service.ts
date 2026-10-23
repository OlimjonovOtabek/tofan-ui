import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { EarningPaymentResponse } from '@coach/core/payments/payment.dto';
import { toPayment } from '@coach/core/payments/payment.mapper';
import {
  Earnings,
  EARNINGS_PAGE_SIZE,
  EarningsPeriod,
  EarningsSummary,
  periodRange,
} from '../models/earnings';
import { PreviewVideo } from '../models/preview-video';

const EARNINGS = '/coach/earnings';
const PREVIEWS = '/coach/preview-videos';

interface EarningsResponse {
  currencyCode: string | null;
  paymentCount: number;
  netAmount: number;
  refundCount: number;
  refundedAmount: number;
}

interface PreviewVideoResponse {
  id: string;
  fileId: string;
  name: string | null;
  videoUrl: string | null;
  hlsUrl: string | null;
  posterUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiClient);

  async publishedProgramCounts(): Promise<{ workout: number; meal: number }> {
    const [workouts, meals] = await Promise.all([
      this.api.get<{ isPublished: boolean }[]>('/coach/workout-programs'),
      this.api.get<{ isPublished: boolean }[]>('/coach/meal-programs'),
    ]);
    return {
      workout: workouts.filter((item) => item.isPublished).length,
      meal: meals.filter((item) => item.isPublished).length,
    };
  }

  async summary(period: EarningsPeriod, today: Date): Promise<EarningsSummary> {
    const { from, to } = periodRange(period, today);
    return this.api.get<EarningsResponse>(EARNINGS, {
      FromDate: isoDate(from),
      ToDate: isoDate(to),
    });
  }

  async payments(
    period: EarningsPeriod,
    today: Date,
    first: number,
  ): Promise<Pick<Earnings, 'payments' | 'totalCount'>> {
    const { from, to } = periodRange(period, today);
    const page = await this.api.get<PagedList<EarningPaymentResponse>>(`${EARNINGS}/payments`, {
      FromDate: isoDate(from),
      ToDate: isoDate(to),
      First: first,
      Rows: EARNINGS_PAGE_SIZE,
      SortField: 'paid_on_utc',
      SortOrder: -1,
    });
    return { payments: page.data.map(toPayment), totalCount: page.totalCount };
  }

  async previewVideos(): Promise<PreviewVideo[]> {
    const responses = await this.api.get<PreviewVideoResponse[]>(PREVIEWS);
    return responses.map((response) => ({
      id: response.id,
      fileId: response.fileId,
      name: response.name?.trim() ?? '',
      videoUrl: this.urlOf(response.videoUrl),
      hlsUrl: this.urlOf(response.hlsUrl),
      posterUrl: this.urlOf(response.posterUrl),
    }));
  }

  addPreviewVideo(fileId: string): Promise<string> {
    return this.api.post<string>(PREVIEWS, { fileId });
  }

  async renamePreviewVideo(id: string, name: string): Promise<void> {
    await this.api.put(`${PREVIEWS}/${encodeURIComponent(id)}`, name === '' ? {} : { name });
  }

  async deletePreviewVideo(id: string): Promise<void> {
    await this.api.delete(`${PREVIEWS}/${encodeURIComponent(id)}`);
  }

  async reorderPreviewVideos(ids: readonly string[]): Promise<void> {
    await this.api.put(`${PREVIEWS}/order`, { videoIds: ids });
  }

  private urlOf(path: string | null): string | null {
    return path ? this.api.url(path) : null;
  }
}

function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
