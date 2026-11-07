import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import {
  DAY_UPLOAD_LINK,
  DayDraft,
  NEW_PROGRAM_UPLOAD_GROUP,
  hasLostUploads,
  pendingUploadsOf,
} from './models/day-draft';
import { MAX_PROGRAM_DAYS } from './models/workout-program';
import {
  NEW_WORKOUT_PROGRAM,
  WorkoutProgramForm,
  canSubmitWorkoutProgram,
  workoutProgramFormOf,
} from './models/workout-program-form';
import { WorkoutProgramsService } from './services/workout-programs.service';

export const PROGRAM_QUEUED = 'queued';

@Injectable()
export class WorkoutProgramFormStore {
  private readonly service = inject(WorkoutProgramsService);
  private readonly notifications = inject(NotificationService);
  private readonly uploads = inject(VideoUploadsStore);
  private programId: string | null = null;
  private submitted = false;

  readonly form = signal<WorkoutProgramForm>(NEW_WORKOUT_PROGRAM);
  readonly days = signal<readonly DayDraft[]>([]);
  readonly published = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);

  readonly lostUploads = computed(() => hasLostUploads(this.days(), this.uploads.uploads()));
  readonly canSubmit = computed(() => canSubmitWorkoutProgram(this.form()) && !this.lostUploads());
  readonly hasPendingUploads = computed(() => pendingUploadsOf(this.days()).length > 0);
  readonly canAddDay = computed(() => this.days().length < MAX_PROGRAM_DAYS);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopUnsubmittedUploads());
  }

  async load(id: string | null): Promise<void> {
    this.programId = id;
    if (id === null) {
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const program = await this.service.get(id);
      this.form.set(workoutProgramFormOf(program));
      this.published.set(program.isPublished);
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  patch(change: Partial<WorkoutProgramForm>): void {
    this.form.update((form) => ({ ...form, ...change }));
  }

  saveDay(index: number | null, day: DayDraft): void {
    this.days.update((days) =>
      index === null ? [...days, day] : days.map((item, at) => (at === index ? day : item)),
    );
  }

  removeDay(index: number): void {
    for (const id of pendingUploadsOf([this.days()[index]])) {
      void this.uploads.cancel(id);
    }
    this.days.update((days) => days.filter((_, at) => at !== index));
  }

  async submit(): Promise<string | null> {
    if (!this.canSubmit() || this.saving()) {
      return null;
    }
    if (this.programId === null && this.hasPendingUploads()) {
      return this.queueNewProgram();
    }
    this.saving.set(true);
    try {
      if (this.programId === null) {
        const id = await this.service.create(this.form(), this.days());
        this.submitted = true;
        this.notifications.success('coachApp.createProgram.success');
        return id;
      }
      await this.service.update(this.programId, this.form());
      this.submitted = true;
      this.notifications.success('coachApp.common.saved');
      return this.programId;
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  isSettled(): boolean {
    return this.submitted;
  }

  private queueNewProgram(): string {
    const form = this.form();
    const days = this.days();
    this.submitted = true;
    this.uploads.saveWhenUploaded({
      ids: pendingUploadsOf(days),
      group: NEW_PROGRAM_UPLOAD_GROUP,
      link: DAY_UPLOAD_LINK,
      save: (uploaded) => this.service.create(form, days, uploaded),
    });
    this.notifications.info('coachApp.createProgram.savedAfterUpload');
    return PROGRAM_QUEUED;
  }

  private stopUnsubmittedUploads(): void {
    if (this.submitted) {
      return;
    }
    for (const id of pendingUploadsOf(this.days())) {
      void this.uploads.cancel(id);
    }
  }
}
