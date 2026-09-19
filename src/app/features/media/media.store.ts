import { Injectable, computed, inject, signal } from '@angular/core';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { MediaUploadDraft, createMediaUpload } from './models/media-upload';
import { StoredFile } from './models/stored-file';
import { MediaService } from './services/media.service';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class MediaStore {
  private readonly mediaService = inject(MediaService);
  private readonly notifications = inject(NotificationService);
  private readonly fileUploadService = inject(FileUploadService);

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

  async upload(draft: MediaUploadDraft): Promise<boolean> {
    this.uploading.set(true);
    this.uploadProgress.set(0);
    try {
      await this.fileUploadService.upload({
        ...createMediaUpload(draft),
        onProgress: (percent) => this.uploadProgress.set(percent),
      });
      this.notifications.success('Fayl yuklandi.');
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
      this.notifications.success(`"${file.displayName}" o'chirildi.`);
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
}
