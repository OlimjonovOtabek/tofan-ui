import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { PlatformFee } from './models/platform-fee';
import { PlatformFeeDraft } from './models/platform-fee-draft';
import { PlatformFeeService } from './services/platform-fee.service';

@Injectable()
export class PlatformFeeStore {
  private readonly platformFeeService = inject(PlatformFeeService);
  private readonly notifications = inject(NotificationService);

  readonly fee = signal<PlatformFee | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.fee.set(await this.platformFeeService.get());
    } catch (error) {
      this.fee.set(null);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(draft: PlatformFeeDraft): Promise<void> {
    this.saving.set(true);
    try {
      await this.platformFeeService.update(draft);
      this.notifications.success('platformFee.toast.saved');
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.saving.set(false);
    }
  }
}
