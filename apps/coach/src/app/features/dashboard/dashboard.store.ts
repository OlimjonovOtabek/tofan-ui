import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { Dashboard } from './models/dashboard';
import { DashboardService } from './services/dashboard.service';

@Injectable()
export class DashboardStore {
  private readonly service = inject(DashboardService);

  readonly dashboard = signal<Dashboard | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.dashboard.set(await this.service.get());
    } catch (error) {
      this.dashboard.set(null);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
