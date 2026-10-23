import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { VideoDetails } from '@coach/core/videos/video';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import {
  DayDraft,
  DayVideoDraft,
  canSaveDay,
  isUploading,
  pendingVideoDraft,
} from './models/day-draft';
import { moveItem } from './models/workout-program';

const STATUS_POLL_MS = 5000;
const TOO_LARGE_CODE = 'StoredFile.TooLarge';

@Injectable()
export class DayEditorStore {
  private readonly uploads = inject(FileUploadService);
  private readonly statuses = inject(VideoStatusService);
  private readonly notifications = inject(NotificationService);
  private readonly files = new Map<string, File>();
  private nextKey = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  readonly title = signal('');
  readonly description = signal('');
  readonly videos = signal<readonly DayVideoDraft[]>([]);
  readonly details = signal<Readonly<Record<string, VideoDetails>>>({});
  readonly droppedExerciseCount = signal(0);

  readonly draft = computed<DayDraft>(() => ({
    title: this.title(),
    description: this.description(),
    videos: this.videos(),
    droppedExerciseCount: this.droppedExerciseCount(),
  }));
  readonly canSave = computed(() => canSaveDay(this.draft()));
  readonly uploading = computed(() => this.videos().some(isUploading));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  init(day: DayDraft): void {
    this.title.set(day.title);
    this.description.set(day.description);
    this.videos.set(day.videos);
    this.droppedExerciseCount.set(day.droppedExerciseCount);
    void this.refreshStatuses();
  }

  addFile(file: File): void {
    const key = `new-${this.nextKey++}`;
    this.files.set(key, file);
    this.videos.update((videos) => [...videos, pendingVideoDraft(key, URL.createObjectURL(file))]);
    void this.upload(key);
  }

  retry(key: string): void {
    this.patch(key, { progress: 0, uploadFailed: false });
    void this.upload(key);
  }

  rename(key: string, name: string): void {
    this.patch(key, { name });
  }

  remove(key: string): void {
    this.revoke(key);
    this.files.delete(key);
    this.videos.update((videos) => videos.filter((video) => video.key !== key));
  }

  reorder(from: number, to: number): void {
    this.videos.update((videos) => moveItem(videos, from, to));
  }

  async refreshStatuses(): Promise<void> {
    const ids = this.videos().flatMap((video) => (video.fileId === null ? [] : [video.fileId]));
    if (ids.length === 0) {
      return;
    }
    try {
      const read = await this.statuses.read(ids);
      this.details.update((known) => ({
        ...known,
        ...Object.fromEntries(read.map((item) => [item.fileId, item])),
      }));
    } catch {
      this.scheduleNextRead();
      return;
    }
    this.scheduleNextRead();
  }

  private scheduleNextRead(): void {
    this.stop();
    const pending = Object.values(this.details()).some((item) => item.status === 'pending');
    if (pending) {
      this.pollTimer = setTimeout(() => void this.refreshStatuses(), STATUS_POLL_MS);
    }
  }

  private stop(): void {
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    for (const video of this.videos()) {
      if (video.localUrl !== null) {
        URL.revokeObjectURL(video.localUrl);
      }
    }
  }

  private async upload(key: string): Promise<void> {
    const file = this.files.get(key);
    if (file === undefined) {
      return;
    }
    try {
      const fileId = await this.uploads.upload({
        file,
        category: 'exerciseVideo',
        onProgress: (percent) => this.patch(key, { progress: percent / 100 }),
      });
      this.patch(key, { fileId, progress: null });
      void this.refreshStatuses();
    } catch (error) {
      if (error instanceof BusinessRuleError && error.code === TOO_LARGE_CODE) {
        this.remove(key);
        this.notifications.failure('coachApp.day.videoTooLarge');
        return;
      }
      this.patch(key, { uploadFailed: true });
      this.notifications.error(error);
    }
  }

  private patch(key: string, change: Partial<DayVideoDraft>): void {
    this.videos.update((videos) =>
      videos.map((video) => (video.key === key ? { ...video, ...change } : video)),
    );
  }

  private revoke(key: string): void {
    const local = this.videos().find((video) => video.key === key)?.localUrl;
    if (local) {
      URL.revokeObjectURL(local);
    }
  }
}
