import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { Earnings, EarningsPeriod, hasMore } from './models/earnings';
import { ProfileService } from './services/profile.service';

@Injectable()
export class EarningsStore {
  private readonly service = inject(ProfileService);
  private readonly notifications = inject(NotificationService);

  readonly period = signal<EarningsPeriod>('thisMonth');
  readonly earnings = signal<Earnings | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly loadingMore = signal(false);
  readonly canLoadMore = computed(() => {
    const earnings = this.earnings();
    return earnings !== null && hasMore(earnings);
  });

  async load(period: EarningsPeriod): Promise<void> {
    this.period.set(period);
    this.earnings.set(null);
    this.loadError.set(null);
    const today = new Date();
    try {
      const [summary, page] = await Promise.all([
        this.service.summary(period, today),
        this.service.payments(period, today, 0),
      ]);
      if (this.period() === period) {
        this.earnings.set({ period, summary, ...page });
      }
    } catch (error) {
      if (this.period() === period) {
        this.loadError.set(toErrorMessage(error));
      }
    }
  }

  async loadMore(): Promise<void> {
    const current = this.earnings();
    if (current === null || !hasMore(current) || this.loadingMore()) {
      return;
    }
    this.loadingMore.set(true);
    try {
      const page = await this.service.payments(current.period, new Date(), current.payments.length);
      if (this.earnings() === current) {
        this.earnings.set({
          ...current,
          payments: [...current.payments, ...page.payments],
          totalCount: page.totalCount,
        });
      }
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loadingMore.set(false);
    }
  }
}
