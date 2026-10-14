import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { CoachFoodDiaryStore } from './coach-food-diary.store';
import { CoachNutritionReportStore } from './coach-nutrition-report.store';
import { CoachWeightReportStore } from './coach-weight-report.store';
import { CoachWorkoutReportStore } from './coach-workout-report.store';
import { LatestRequest } from './models/coach-latest-request';
import { CoachClientProfile } from './models/coach-client';
import { CoachClientDetailService } from './services/coach-client-detail.service';
import { CoachClientSummary } from './models/coach-client';
import { CoachClientsService } from './services/coach-clients.service';

@Injectable()
export class CoachClientDetailStore {
  private readonly service = inject(CoachClientDetailService);
  private readonly clientsService = inject(CoachClientsService);
  private readonly reports = [
    inject(CoachWeightReportStore),
    inject(CoachWorkoutReportStore),
    inject(CoachNutritionReportStore),
    inject(CoachFoodDiaryStore),
  ] as const;
  private readonly latest = new LatestRequest();

  readonly profile = signal<CoachClientProfile | null>(null);
  readonly summary = signal<CoachClientSummary | null>(null);
  readonly loading = signal(false);
  readonly profileError = signal<ErrorMessage | null>(null);
  readonly summaryError = signal<ErrorMessage | null>(null);

  async load(userId: string): Promise<void> {
    const isCurrent = this.latest.begin();
    this.clear();
    this.loading.set(true);
    const [profile, clients] = await Promise.allSettled([
      this.service.getProfile(userId),
      this.clientsService.list(),
    ]);
    if (!isCurrent()) {
      return;
    }
    if (profile.status === 'rejected') {
      this.profileError.set(toErrorMessage(profile.reason));
      this.loading.set(false);
      return;
    }
    this.profile.set(profile.value);
    this.setSummary(userId, clients);
    await Promise.all(this.reports.map((report) => report.show(userId)));
    if (isCurrent()) {
      this.loading.set(false);
    }
  }

  private clear(): void {
    this.profile.set(null);
    this.profileError.set(null);
    this.summary.set(null);
    this.summaryError.set(null);
    for (const report of this.reports) {
      report.clear();
    }
  }

  private setSummary(userId: string, result: PromiseSettledResult<CoachClientSummary[]>): void {
    if (result.status === 'rejected') {
      this.summaryError.set(toErrorMessage(result.reason));
      return;
    }
    this.summary.set(result.value.find((client) => client.userId === userId) ?? null);
  }
}
