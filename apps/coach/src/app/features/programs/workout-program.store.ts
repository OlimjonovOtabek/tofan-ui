import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { DAY_UPLOAD_GROUP, DayDraft, pendingUploadsOf } from './models/day-draft';
import { WorkoutProgramDetail, moveItem } from './models/workout-program';
import { WorkoutProgramsService } from './services/workout-programs.service';

export type WorkoutProgramBusy = 'publishing' | 'deleting' | 'days' | null;

@Injectable()
export class WorkoutProgramStore {
  private readonly service = inject(WorkoutProgramsService);
  private readonly notifications = inject(NotificationService);
  private readonly uploads = inject(VideoUploadsStore);
  private programId = '';

  readonly program = signal<WorkoutProgramDetail | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly busy = signal<WorkoutProgramBusy>(null);

  constructor() {
    this.uploads.saves$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((result) => {
      if (result.succeeded && result.group === DAY_UPLOAD_GROUP && result.tag === this.programId) {
        void this.reload();
      }
    });
  }

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
    const programId = this.programId;
    return this.queueWhileUploading(day, (uploaded) =>
      this.service.addDay(programId, day, uploaded),
    )
      ? Promise.resolve(true)
      : this.run('days', () => this.service.addDay(programId, day));
  }

  updateDay(dayId: string, day: DayDraft): Promise<boolean> {
    const programId = this.programId;
    return this.queueWhileUploading(day, (uploaded) =>
      this.service.updateDay(programId, dayId, day, uploaded),
    )
      ? Promise.resolve(true)
      : this.run('days', () => this.service.updateDay(programId, dayId, day));
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

  private queueWhileUploading(
    day: DayDraft,
    save: (uploaded: Readonly<Record<string, string>>) => Promise<unknown>,
  ): boolean {
    const ids = pendingUploadsOf([day]);
    if (ids.length === 0) {
      return false;
    }
    this.uploads.saveWhenUploaded({
      ids,
      save,
      group: DAY_UPLOAD_GROUP,
      tag: this.programId,
      link: `/programs/workout/${this.programId}`,
    });
    this.notifications.info('coachApp.day.savedAfterUpload');
    return true;
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
