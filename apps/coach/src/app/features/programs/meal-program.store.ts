import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { MealProgramDetail } from './models/meal-program';
import { MealProgramsService } from './services/meal-programs.service';

export type MealProgramBusy = 'publishing' | 'deleting' | null;

@Injectable()
export class MealProgramStore {
  private readonly service = inject(MealProgramsService);
  private readonly notifications = inject(NotificationService);
  private programId = '';

  readonly program = signal<MealProgramDetail | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly busy = signal<MealProgramBusy>(null);

  async load(id: string): Promise<void> {
    this.programId = id;
    this.loadError.set(null);
    try {
      this.program.set(await this.service.get(id));
    } catch (error) {
      this.program.set(null);
      this.loadError.set(toErrorMessage(error));
    }
  }

  togglePublished(): Promise<boolean> {
    const published = this.program()?.isPublished ?? false;
    return this.run(
      'publishing',
      () =>
        published ? this.service.unpublish(this.programId) : this.service.publish(this.programId),
      published ? 'coachApp.workoutProgram.unpublished' : 'coachApp.programs.publishSuccess',
      true,
    );
  }

  delete(): Promise<boolean> {
    return this.run(
      'deleting',
      () => this.service.delete(this.programId),
      'coachApp.workoutProgram.deleted',
      false,
    );
  }

  private async run(
    busy: Exclude<MealProgramBusy, null>,
    action: () => Promise<void>,
    success: TranslationKey,
    reload: boolean,
  ): Promise<boolean> {
    if (this.busy() !== null) {
      return false;
    }
    this.busy.set(busy);
    try {
      await action();
      this.notifications.success(success);
      if (reload) {
        this.program.set(await this.service.get(this.programId));
      }
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.busy.set(null);
    }
  }
}
