import { Injectable, inject, signal } from '@angular/core';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { FileUploadTask, isUploadCancelled } from '@shared/components/file-upload/file-upload-request';
import { NotificationService } from '@core/feedback/notification.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { CoachProfile, UpdateCoachProfileRequest } from '@coach/core/profile/coach-profile.dto';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';

@Injectable()
export class CoachProfileStore {
  private readonly service = inject(CoachProfileService);
  private readonly uploads = inject(FileUploadService);
  private readonly notifications = inject(NotificationService);
  private uploadTask: FileUploadTask | null = null;

  readonly profile = signal<CoachProfile | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.profile.set(await this.service.get());
    } catch (error) {
      this.profile.set(null);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(request: UpdateCoachProfileRequest): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.service.update(request);
      this.notifications.success('coach.profile.saved');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async uploadPhoto(file: File): Promise<string | null> {
    if (this.uploadTask !== null) {
      return null;
    }
    this.uploadProgress.set(0);
    const task = this.uploads.startUpload({
      file,
      category: 'avatar',
      onProgress: (progress) => this.uploadProgress.set(progress),
    });
    this.uploadTask = task;
    try {
      return await task.result;
    } catch (error) {
      if (!isUploadCancelled(error)) {
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

  cancelPhotoUpload(): void {
    this.uploadTask?.cancel();
  }
}
