import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { LatestRequest } from './models/coach-latest-request';
import { ReportRange, periodRange } from './models/coach-report-period';
import { CoachDailyNutrition } from './services/coach-client-detail.dto';
import { CoachClientDetailService } from './services/coach-client-detail.service';

const DEFAULT_DAYS = 7;

@Injectable()
export class CoachNutritionReportStore {
  private readonly service = inject(CoachClientDetailService);
  private readonly latest = new LatestRequest();
  private readonly defaultRange = periodRange(DEFAULT_DAYS, new Date());
  private userId: string | null = null;

  readonly nutrition = signal<readonly CoachDailyNutrition[]>([]);
  readonly nutritionError = signal<ErrorMessage | null>(null);
  readonly nutritionFrom = signal(this.defaultRange.from);
  readonly nutritionTo = signal(this.defaultRange.to);

  show(userId: string): Promise<void> {
    this.userId = userId;
    return this.load();
  }

  clear(): void {
    this.latest.cancel();
    this.userId = null;
    this.nutrition.set([]);
    this.nutritionError.set(null);
  }

  setNutritionRange(range: ReportRange): Promise<void> {
    this.nutritionFrom.set(range.from);
    this.nutritionTo.set(range.to);
    return this.load();
  }

  retryNutrition(): Promise<void> {
    return this.load();
  }

  private async load(): Promise<void> {
    const userId = this.userId;
    if (userId === null) {
      return;
    }
    const isCurrent = this.latest.begin();
    try {
      const nutrition = await this.service.getNutrition(userId, this.nutritionFrom(), this.nutritionTo());
      if (isCurrent()) {
        this.nutrition.set(nutrition);
        this.nutritionError.set(null);
      }
    } catch (error) {
      if (isCurrent()) {
        this.nutrition.set([]);
        this.nutritionError.set(toErrorMessage(error));
      }
    }
  }
}
