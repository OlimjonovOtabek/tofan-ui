import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { Benefit } from '@shared/models/benefit';
import { Tier } from '@shared/models/tier';
import { TierBenefits } from './models/tier-benefits';
import { TierBenefitsService } from './services/tier-benefits.service';

@Injectable()
export class TrainerTiersStore {
  private readonly tierBenefitsService = inject(TierBenefitsService);
  private readonly notifications = inject(NotificationService);

  private readonly tierList = signal<readonly TierBenefits[]>([]);

  readonly tiers = this.tierList.asReadonly();
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.tierList.set(await this.tierBenefitsService.list());
    } catch (error) {
      this.tierList.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async changeBenefits(tier: Tier, benefits: readonly Benefit[]): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.tierBenefitsService.change(tier, benefits);
      this.notifications.success('trainers.tiers.saved');
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
