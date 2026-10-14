import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { LatestRequest } from './models/coach-latest-request';
import { toIsoDate } from './models/coach-report-period';
import { CoachFoodLog } from './models/coach-client';
import { CoachClientDetailService } from './services/coach-client-detail.service';

@Injectable()
export class CoachFoodDiaryStore {
  private readonly service = inject(CoachClientDetailService);
  private readonly latest = new LatestRequest();
  private userId: string | null = null;

  readonly foodLogs = signal<readonly CoachFoodLog[]>([]);
  readonly foodLogsError = signal<ErrorMessage | null>(null);
  readonly foodLogDate = signal(toIsoDate(new Date()));

  show(userId: string): Promise<void> {
    this.userId = userId;
    return this.load();
  }

  clear(): void {
    this.latest.cancel();
    this.userId = null;
    this.foodLogs.set([]);
    this.foodLogsError.set(null);
  }

  selectDiaryDay(date: string): Promise<void> {
    this.foodLogDate.set(date);
    return this.load();
  }

  retryDiary(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    const userId = this.userId;
    if (userId === null) {
      return;
    }
    const isCurrent = this.latest.begin();
    this.foodLogsError.set(null);
    try {
      const logs = await this.service.getFoodLogs(userId, this.foodLogDate());
      if (isCurrent()) {
        this.foodLogs.set(logs);
      }
    } catch (error) {
      if (isCurrent()) {
        this.foodLogs.set([]);
        this.foodLogsError.set(toErrorMessage(error));
      }
    }
  }
}
