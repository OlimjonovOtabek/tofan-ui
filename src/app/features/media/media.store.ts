import { Injectable, computed, inject, signal } from '@angular/core';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { ExerciseChoice } from './models/exercise-choice';
import { MediaUpload, MediaUploadDraft, createMediaUpload } from './models/media-upload';
import { StoredFile } from './models/stored-file';
import { ExerciseVideosService } from './services/exercise-videos.service';
import { MediaService } from './services/media.service';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class MediaStore {
  private readonly mediaService = inject(MediaService);
  private readonly notifications = inject(NotificationService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly exerciseVideosService = inject(ExerciseVideosService);

  private readonly page = signal<Page<StoredFile>>(emptyPage<StoredFile>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly files = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly first = computed(() => this.currentRequest().first);
  readonly deletingId = signal<string | null>(null);
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly exerciseChoices = signal<readonly ExerciseChoice[]>([]);
  readonly exerciseChoicesLoading = signal(false);
  readonly exerciseChoicesError = signal<string | null>(null);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.mediaService.list(request));
    } catch (error) {
      this.page.set(emptyPage<StoredFile>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  contentUrl(file: StoredFile): string {
    return this.mediaService.contentUrl(file.id);
  }

  async loadExerciseChoices(): Promise<void> {
    this.exerciseChoicesLoading.set(true);
    this.exerciseChoicesError.set(null);
    try {
      this.exerciseChoices.set(await this.exerciseVideosService.listWithoutVideo());
    } catch (error) {
      this.exerciseChoices.set([]);
      this.exerciseChoicesError.set(toErrorMessage(error));
    } finally {
      this.exerciseChoicesLoading.set(false);
    }
  }

  async upload(draft: MediaUploadDraft): Promise<boolean> {
    this.uploading.set(true);
    this.uploadProgress.set(0);
    try {
      const upload = createMediaUpload(draft);
      await this.send(upload);
      this.notifications.success(
        upload.exerciseId === undefined ? 'media.page.uploaded' : 'media.page.videoAttached',
      );
      await this.load({ ...this.currentRequest(), first: 0 });
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.uploading.set(false);
    }
  }

  async remove(file: StoredFile): Promise<void> {
    this.deletingId.set(file.id);
    try {
      await this.mediaService.delete(file.id);
      this.notifications.success('media.page.deleted', { name: file.displayName });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
      if (error instanceof NotFoundError) {
        await this.load();
      }
    } finally {
      this.deletingId.set(null);
    }
  }

  private async send({ file, category, caption, exerciseId }: MediaUpload): Promise<void> {
    const fileId = await this.fileUploadService.upload({
      file,
      category,
      caption,
      onProgress: (percent) => this.uploadProgress.set(percent),
    });
    if (exerciseId === undefined) {
      return;
    }
    try {
      await this.exerciseVideosService.attachVideo(exerciseId, fileId);
    } catch (error) {
      await this.mediaService.delete(fileId).catch(reportTheAttachFailureInstead);
      throw error;
    }
  }
}

function reportTheAttachFailureInstead(): void {
  return;
}
