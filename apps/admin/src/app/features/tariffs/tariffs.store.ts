import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { Tariff } from './models/tariff';
import { TariffDraft, createTariffDraft } from './models/tariff-draft';
import { TariffType } from './models/tariff-type';
import { TariffsService } from './services/tariffs.service';

@Injectable()
export class TariffsStore {
  private readonly tariffsService = inject(TariffsService);
  private readonly notifications = inject(NotificationService);

  readonly tariffs = signal<readonly Tariff[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.tariffs.set(await this.tariffsService.list());
    } catch (error) {
      this.tariffs.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async change(type: TariffType, draft: TariffDraft): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.tariffsService.change(type, createTariffDraft(type, draft));
      this.notifications.success('tariffs.toast.saved');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}
