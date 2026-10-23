import { Injectable, inject, signal } from '@angular/core';
import { CoachProfile, CoachProfileChange } from '@coach/core/profile/coach-profile.dto';
import { toCoachProfileChange } from '@coach/core/profile/coach-profile.mapper';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';

@Injectable()
export class ProfileEditStore {
  private readonly service = inject(CoachProfileService);
  private readonly notifications = inject(NotificationService);

  readonly profile = signal<CoachProfile | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);

  async load(): Promise<void> {
    this.loadError.set(null);
    try {
      this.profile.set(await this.service.get());
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  async save(change: Partial<CoachProfileChange>, success: TranslationKey): Promise<boolean> {
    const profile = this.profile();
    if (profile === null || this.saving()) {
      return false;
    }
    this.saving.set(true);
    try {
      await this.service.update(toCoachProfileChange(profile, change));
      this.notifications.success(success);
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}
