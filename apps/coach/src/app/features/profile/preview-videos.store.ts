import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { VideoDetails } from '@coach/core/videos/video';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { PreviewVideo, isFull } from './models/preview-video';
import { ProfileService } from './services/profile.service';

const POLL_MS = 5000;

@Injectable()
export class PreviewVideosStore {
  private readonly service = inject(ProfileService);
  private readonly uploads = inject(FileUploadService);
  private readonly statuses = inject(VideoStatusService);
  private readonly notifications = inject(NotificationService);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly videos = signal<readonly PreviewVideo[] | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly details = signal<Readonly<Record<string, VideoDetails>>>({});
  readonly uploadProgress = signal<number | null>(null);
  readonly busy = signal(false);

  readonly full = computed(() => isFull(this.videos() ?? []));
  readonly working = computed(() => this.busy() || this.uploadProgress() !== null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopPolling());
  }

  async load(): Promise<void> {
    this.loadError.set(null);
    try {
      this.videos.set(await this.service.previewVideos());
      void this.refreshStatuses();
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  async add(file: File): Promise<void> {
    if (this.working() || this.full()) {
      return;
    }
    this.uploadProgress.set(0);
    try {
      const fileId = await this.uploads.upload({
        file,
        category: 'exerciseVideo',
        onProgress: (percent) => this.uploadProgress.set(percent / 100),
      });
      await this.service.addPreviewVideo(fileId);
      await this.load();
    } catch (error) {
      if (error instanceof BusinessRuleError && error.code === 'StoredFile.TooLarge') {
        this.notifications.failure('coachApp.day.videoTooLarge');
      } else {
        this.notifications.error(error);
      }
    } finally {
      this.uploadProgress.set(null);
    }
  }

  rename(id: string, name: string): Promise<void> {
    return this.change(() => this.service.renamePreviewVideo(id, name.trim()));
  }

  delete(id: string): Promise<void> {
    return this.change(() => this.service.deletePreviewVideo(id));
  }

  async reorder(from: number, to: number): Promise<void> {
    const videos = [...(this.videos() ?? [])];
    if (from === to || from < 0 || to < 0 || from >= videos.length || to >= videos.length) {
      return;
    }
    const [moved] = videos.splice(from, 1);
    videos.splice(to, 0, moved);
    const previous = this.videos();
    this.videos.set(videos);
    try {
      await this.service.reorderPreviewVideos(videos.map((video) => video.id));
    } catch (error) {
      this.videos.set(previous);
      this.notifications.error(error);
    }
  }

  private async change(action: () => Promise<void>): Promise<void> {
    if (this.working()) {
      return;
    }
    this.busy.set(true);
    try {
      await action();
      this.videos.set(await this.service.previewVideos());
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.busy.set(false);
    }
  }

  private async refreshStatuses(): Promise<void> {
    this.stopPolling();
    const ids = (this.videos() ?? []).map((video) => video.fileId);
    if (ids.length === 0) {
      return;
    }
    try {
      const read = await this.statuses.read(ids);
      this.details.set(Object.fromEntries(read.map((item) => [item.fileId, item])));
    } catch {
      return;
    }
    if (read(this.details())) {
      this.timer = setTimeout(() => void this.refreshStatuses(), POLL_MS);
    }
  }

  private stopPolling(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

function read(details: Readonly<Record<string, VideoDetails>>): boolean {
  return Object.values(details).some((item) => item.status === 'pending');
}
