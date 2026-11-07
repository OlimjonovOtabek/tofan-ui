import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoDetails } from '@coach/core/videos/video';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { PreviewVideo, isFull } from './models/preview-video';
import { ProfileService } from './services/profile.service';

const POLL_MS = 5000;
const PREVIEW_UPLOAD_GROUP = 'preview-videos';
const PREVIEW_UPLOAD_LINK = '/profile/preview-videos';

@Injectable()
export class PreviewVideosStore {
  private readonly service = inject(ProfileService);
  private readonly uploads = inject(VideoUploadsStore);
  private readonly statuses = inject(VideoStatusService);
  private readonly notifications = inject(NotificationService);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly videos = signal<readonly PreviewVideo[] | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly details = signal<Readonly<Record<string, VideoDetails>>>({});
  readonly uploadProgress = computed(() => this.uploads.progressIn(PREVIEW_UPLOAD_GROUP));
  readonly preparing = computed(() =>
    Object.values(this.uploads.uploads()).some(
      (upload) => upload.group === PREVIEW_UPLOAD_GROUP && upload.status.kind === 'compressing',
    ),
  );
  readonly busy = signal(false);

  readonly full = computed(() => isFull(this.videos() ?? []));
  readonly working = computed(() => this.busy() || this.uploadProgress() !== null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.stopPolling());
    this.uploads.saves$.pipe(takeUntilDestroyed(destroyRef)).subscribe((result) => {
      if (result.group === PREVIEW_UPLOAD_GROUP) {
        void this.load();
      }
    });
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

  add(file: File): void {
    if (this.working() || this.full()) {
      return;
    }
    const id = this.uploads.start(file, { group: PREVIEW_UPLOAD_GROUP, link: PREVIEW_UPLOAD_LINK });
    this.uploads.saveWhenUploaded({
      ids: [id],
      group: PREVIEW_UPLOAD_GROUP,
      link: PREVIEW_UPLOAD_LINK,
      save: (fileIds) => this.service.addPreviewVideo(fileIds[id]),
    });
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
