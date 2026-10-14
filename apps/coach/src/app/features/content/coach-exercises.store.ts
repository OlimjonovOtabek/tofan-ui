import { Injectable, inject, signal } from '@angular/core';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { FileUploadTask, isUploadCancelled } from '@shared/components/file-upload/file-upload-request';
import { NotificationService } from '@core/feedback/notification.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { CoachExercise, CoachExerciseDraft } from './models/coach-exercise';
import { CoachContentService } from './services/coach-content.service';
import { CoachExercisesService } from './services/coach-exercises.service';

@Injectable()
export class CoachExercisesStore {
  private readonly content = inject(CoachContentService);
  private readonly service = inject(CoachExercisesService);
  private readonly uploads = inject(FileUploadService);
  private readonly notifications = inject(NotificationService);
  private uploadTask: FileUploadTask | null = null;

  readonly items = signal<readonly CoachExercise[]>([]);
  readonly searchText = signal('');
  readonly appliedSearch = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly uploadFailed = signal(false);
  readonly error = signal<ErrorMessage | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const search = this.searchText().trim();
    try {
      this.items.set(await this.content.listExercises(search));
      this.appliedSearch.set(search);
    } catch (error) {
      this.items.set([]);
      this.error.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(id: string | null, draft: CoachExerciseDraft): Promise<boolean> {
    if (this.saving()) {
      return false;
    }
    this.saving.set(true);
    try {
      if (id === null) {
        await this.service.create(draft);
      } else {
        await this.service.update(id, draft);
      }
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async uploadVideo(file: File): Promise<string | null> {
    if (this.uploadTask !== null) {
      return null;
    }
    this.uploadProgress.set(0);
    this.uploadFailed.set(false);
    const task = this.uploads.startUpload({
      file,
      category: 'exerciseVideo',
      onProgress: (progress) => this.uploadProgress.set(progress),
    });
    this.uploadTask = task;
    try {
      return await task.result;
    } catch (error) {
      if (!isUploadCancelled(error)) {
        this.uploadFailed.set(true);
        this.notifications.error(error);
      }
      return null;
    } finally {
      if (this.uploadTask === task) {
        this.uploadTask = null;
        this.uploadProgress.set(null);
      }
    }
  }

  cancelVideoUpload(): void {
    this.uploadTask?.cancel();
  }
}
