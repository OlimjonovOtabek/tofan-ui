import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { LatestRequest } from './models/coach-latest-request';
import { ReportRange, localDayEnd, localDayStart, periodRange } from './models/coach-report-period';
import { CoachWeightPoint } from './services/coach-client-detail.dto';
import { CoachClientDetailService } from './services/coach-client-detail.service';

const DEFAULT_DAYS = 30;

@Injectable()
export class CoachWeightReportStore {
  private readonly service = inject(CoachClientDetailService);
  private readonly latest = new LatestRequest();
  private readonly defaultRange = periodRange(DEFAULT_DAYS, new Date());
  private userId: string | null = null;

  readonly weights = signal<readonly CoachWeightPoint[]>([]);
  readonly weightError = signal<ErrorMessage | null>(null);
  readonly weightFrom = signal(this.defaultRange.from);
  readonly weightTo = signal(this.defaultRange.to);

  show(userId: string): Promise<void> {
    this.userId = userId;
    return this.load();
  }

  clear(): void {
    this.latest.cancel();
    this.userId = null;
    this.weights.set([]);
    this.weightError.set(null);
  }

  setWeightRange(range: ReportRange): Promise<void> {
    this.weightFrom.set(range.from);
    this.weightTo.set(range.to);
    return this.load();
  }

  retryWeights(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    const userId = this.userId;
    if (userId === null) {
      return;
    }
    const isCurrent = this.latest.begin();
    try {
      const weights = await this.service.getWeightHistory(
        userId,
        localDayStart(this.weightFrom()),
        localDayEnd(this.weightTo()),
      );
      if (isCurrent()) {
        this.weights.set(weights);
        this.weightError.set(null);
      }
    } catch (error) {
      if (isCurrent()) {
        this.weights.set([]);
        this.weightError.set(toErrorMessage(error));
      }
    }
  }
}
