import { Injectable, computed, inject, signal } from '@angular/core';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { StoredFile } from './models/stored-file';
import { FileUsage } from './models/file-usage';
import { toExerciseVideoUsage } from './services/stored-file.mapper';
import { MediaService } from './services/media.service';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

const EXERCISE_BATCH_SIZE = 1000;

@Injectable()
export class MediaStore {
  private readonly mediaService = inject(MediaService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<StoredFile>>(emptyPage<StoredFile>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly files = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly first = computed(() => this.currentRequest().first);
  readonly checkingUsagesOf = signal<string | null>(null);

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

  async findUsages(file: StoredFile): Promise<readonly FileUsage[] | null> {
    this.checkingUsagesOf.set(file.id);
    try {
      return await this.exerciseVideoUsages(file.id);
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.checkingUsagesOf.set(null);
    }
  }

  async remove(file: StoredFile): Promise<void> {
    try {
      await this.mediaService.delete(file.id);
      this.notifications.success(`"${file.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  private async exerciseVideoUsages(fileId: string): Promise<readonly FileUsage[]> {
    const usages: FileUsage[] = [];
    for (let first = 0; ; first += EXERCISE_BATCH_SIZE) {
      const page = await this.mediaService.listExerciseVideos({ first, rows: EXERCISE_BATCH_SIZE });
      const exercises = page.data;
      usages.push(
        ...exercises.filter((item) => item.videoFileId === fileId).map(toExerciseVideoUsage),
      );
      if (exercises.length === 0 || first + EXERCISE_BATCH_SIZE >= page.totalCount) {
        return usages;
      }
    }
  }
}
