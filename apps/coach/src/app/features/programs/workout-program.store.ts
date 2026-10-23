import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { DayDraft } from './models/day-draft';
import { WorkoutProgramDetail, moveItem } from './models/workout-program';
import { WorkoutProgramsService } from './services/workout-programs.service';

export type WorkoutProgramBusy = 'publishing' | 'deleting' | 'days' | null;

@Injectable()
export class WorkoutProgramStore {
  private readonly service = inject(WorkoutProgramsService);
  private readonly notifications = inject(NotificationService);
  private programId = '';

  readonly program = signal<WorkoutProgramDetail | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly busy = signal<WorkoutProgramBusy>(null);

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
    );
  }

  async delete(): Promise<boolean> {
    return this.run(
      'deleting',
      () => this.service.delete(this.programId),
      'coachApp.workoutProgram.deleted',
      false,
    );
  }

  addDay(day: DayDraft): Promise<boolean> {
    return this.run('days', () => this.service.addDay(this.programId, day));
  }

  updateDay(dayId: string, day: DayDraft): Promise<boolean> {
    return this.run('days', () => this.service.updateDay(this.programId, dayId, day));
  }

  deleteDay(dayId: string): Promise<boolean> {
    return this.run('days', () => this.service.deleteDay(this.programId, dayId));
  }

  moveDay(index: number, offset: number): Promise<boolean> {
    const days = this.program()?.days ?? [];
    const target = index + offset;
    if (target < 0 || target >= days.length) {
      return Promise.resolve(false);
    }
    const ids = moveItem(days, index, target).map((day) => day.id);
    return this.run('days', () => this.service.reorderDays(this.programId, ids));
  }

  private async run(
    busy: Exclude<WorkoutProgramBusy, null>,
    action: () => Promise<unknown>,
    success?: TranslationKey,
    reload = true,
  ): Promise<boolean> {
    if (this.busy() !== null) {
      return false;
    }
    this.busy.set(busy);
    try {
      await action();
      if (success !== undefined) {
        this.notifications.success(success);
      }
      if (reload) {
        await this.reload();
      }
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.busy.set(null);
    }
  }

  private async reload(): Promise<void> {
    try {
      this.program.set(await this.service.get(this.programId));
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
