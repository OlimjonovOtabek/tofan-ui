import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoDetails } from '@coach/core/videos/video';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { VideoUpload } from '@coach/core/videos/video-upload';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import {
  DAY_UPLOAD_GROUP,
  DAY_UPLOAD_LINK,
  DayDraft,
  DayVideoDraft,
  EMPTY_DAY_DRAFT,
  canSaveDay,
  dayFingerprint,
  isUploading,
  pendingUploadsOf,
  pendingVideoDraft,
  withUpload,
} from './models/day-draft';
import { moveItem } from './models/workout-program';

const STATUS_POLL_MS = 5000;

@Injectable()
export class DayEditorStore {
  private readonly uploads = inject(VideoUploadsStore);
  private readonly statuses = inject(VideoStatusService);
  private readonly notifications = inject(NotificationService);
  private readonly started = new Set<string>();
  private readonly drafts = signal<readonly DayVideoDraft[]>([]);
  private readonly initial = signal<DayDraft>(EMPTY_DAY_DRAFT);
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private finished = false;

  readonly title = signal('');
  readonly description = signal('');
  readonly videos = computed(() =>
    this.drafts().map((video) => withUpload(video, this.uploads.uploads()[video.key])),
  );
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
  readonly hasChanges = computed(
    () => dayFingerprint(this.draft()) !== dayFingerprint(this.initial()),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.stop());
    this.uploads.changes$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((upload) => this.onUploadChanged(upload));
  }

  init(day: DayDraft): void {
    this.initial.set(day);
    this.title.set(day.title);
    this.description.set(day.description);
    this.drafts.set(day.videos);
    this.droppedExerciseCount.set(day.droppedExerciseCount);
    void this.refreshStatuses();
  }

  addFile(file: File): void {
    const key = this.uploads.start(file, { group: DAY_UPLOAD_GROUP, link: DAY_UPLOAD_LINK });
    this.started.add(key);
    this.drafts.update((videos) => [...videos, pendingVideoDraft(key, URL.createObjectURL(file))]);
  }

  retry(key: string): void {
    this.uploads.retry(key);
  }

  rename(key: string, name: string): void {
    this.drafts.update((videos) =>
      videos.map((video) => (video.key === key ? { ...video, name } : video)),
    );
  }

  remove(key: string): void {
    this.revoke(key);
    if (this.started.delete(key)) {
      void this.uploads.cancel(key);
    }
    this.drafts.update((videos) => videos.filter((video) => video.key !== key));
  }

  reorder(from: number, to: number): void {
    this.drafts.update((videos) => moveItem(videos, from, to));
  }

  finish(): DayDraft {
    this.finished = true;
    const day = this.draft();
    const kept = new Set(pendingUploadsOf([day]));
    const earlier = pendingUploadsOf([this.initial()]);
    for (const key of [...this.started, ...earlier]) {
      if (!kept.has(key)) {
        void this.uploads.cancel(key);
      }
    }
    this.revokeAll();
    return { ...day, videos: day.videos.map((video) => ({ ...video, localUrl: null })) };
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

  private onUploadChanged(upload: VideoUpload): void {
    if (!this.drafts().some((video) => video.key === upload.id)) {
      return;
    }
    if (upload.status.kind === 'done') {
      void this.refreshStatuses();
    } else if (upload.status.kind === 'failed') {
      this.notifications.error(upload.status.error);
    } else if (upload.status.kind === 'tooLarge') {
      this.remove(upload.id);
      void this.uploads.cancel(upload.id);
      this.notifications.failure('coachApp.day.videoTooLarge');
    }
  }

  private scheduleNextRead(): void {
    this.stopPolling();
    const pending = Object.values(this.details()).some((item) => item.status === 'pending');
    if (pending) {
      this.pollTimer = setTimeout(() => void this.refreshStatuses(), STATUS_POLL_MS);
    }
  }

  private stop(): void {
    this.stopPolling();
    if (!this.finished) {
      for (const key of this.started) {
        void this.uploads.cancel(key);
      }
    }
    this.revokeAll();
  }

  private stopPolling(): void {
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private revoke(key: string): void {
    const local = this.drafts().find((video) => video.key === key)?.localUrl;
    if (local) {
      URL.revokeObjectURL(local);
    }
  }

  private revokeAll(): void {
    for (const video of this.drafts()) {
      this.revoke(video.key);
    }
  }
}
