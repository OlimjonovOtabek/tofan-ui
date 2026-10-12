import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { CoachFoodRequest, CoachFoodSummary } from './services/coach-content.dto';
import { CoachFoodsService } from './services/coach-foods.service';

@Injectable()
export class CoachFoodsStore {
  private readonly service = inject(CoachFoodsService);
  private readonly notifications = inject(NotificationService);

  readonly items = signal<readonly CoachFoodSummary[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ErrorMessage | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.list());
    } catch (error) {
      this.items.set([]);
      this.error.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(id: string | null, request: CoachFoodRequest): Promise<boolean> {
    if (this.saving()) {
      return false;
    }
    this.saving.set(true);
    try {
      if (id === null) {
        await this.service.create(request);
      } else {
        await this.service.update(id, request);
      }
      this.notifications.success('coach.content.foodSaved');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.service.delete(id);
      this.notifications.success('coach.content.foodDeleted');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    }
  }
}
