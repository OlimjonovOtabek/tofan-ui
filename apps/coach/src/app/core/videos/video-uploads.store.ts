import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { Subject } from 'rxjs';
import { TusUploadService } from './tus-upload.service';
import { VideoCompressorService, VideoCopy } from './video-compressor.service';
import {
  QueuedVideoSave,
  VIDEO_UPLOAD_MAX_BYTES,
  VideoUpload,
  VideoUploadSaveResult,
  VideoUploadStatus,
  VideoUploadTarget,
  fileIdsOf,
  isActiveUpload,
  isLostUpload,
  isSameProgress,
  isVideoFileAccepted,
  isVideoTooLargeError,
  meanProgress,
  summarizeUploads,
} from './video-upload';

interface UploadRun {
  readonly source: File;
  copy: VideoCopy | null;
  abort: AbortController;
}

@Injectable({ providedIn: 'root' })
export class VideoUploadsStore {
  private readonly tus = inject(TusUploadService);
  private readonly compressor = inject(VideoCompressorService);
  private readonly notifications = inject(NotificationService);
  private readonly runs = new Map<string, UploadRun>();
  private readonly changeEvents = new Subject<VideoUpload>();
  private readonly saveEvents = new Subject<VideoUploadSaveResult>();
  private readonly state = signal<Readonly<Record<string, VideoUpload>>>({});
  private readonly queue = signal<readonly QueuedVideoSave[]>([]);
  private readonly sending = signal<readonly QueuedVideoSave[]>([]);
  private nextId = 0;

  readonly uploads = this.state.asReadonly();
  readonly changes$ = this.changeEvents.asObservable();
  readonly saves$ = this.saveEvents.asObservable();
  readonly summary = computed(() =>
    summarizeUploads(
      Object.values(this.state()),
      [...this.queue(), ...this.sending()].map((save) => save.link),
    ),
  );
  readonly busy = computed(() => this.summary() !== null);

  start(source: File, target: VideoUploadTarget): string {
    const id = `upload-${this.nextId++}`;
    this.state.update((uploads) => ({
      ...uploads,
      [id]: { id, ...target, status: { kind: 'compressing', progress: 0 } },
    }));
    const run: UploadRun = { source, copy: null, abort: new AbortController() };
    this.runs.set(id, run);
    void this.run(id, run);
    return id;
  }

  retry(id: string): void {
    const run = this.runs.get(id);
    if (run !== undefined && this.state()[id]?.status.kind === 'failed') {
      run.abort = new AbortController();
      void this.run(id, run);
    }
  }

  async cancel(id: string): Promise<void> {
    const run = this.runs.get(id);
    if (run === undefined) {
      return;
    }
    this.forget(id);
    run.abort.abort();
    await run.copy?.discard();
    this.settle();
  }

  saveWhenUploaded(save: QueuedVideoSave): void {
    this.queue.update((queue) => [...queue, save]);
    this.settle();
  }

  progressIn(group: string): number | null {
    const uploads = Object.values(this.state()).filter(
      (upload) => upload.group === group && isActiveUpload(upload.status),
    );
    if (uploads.length > 0) {
      return meanProgress(uploads);
    }
    return [...this.queue(), ...this.sending()].some((save) => save.group === group) ? 1 : null;
  }

  preparingIn(group: string): boolean {
    return Object.values(this.state()).some(
      (upload) => upload.group === group && upload.status.kind === 'compressing',
    );
  }

  private async run(id: string, run: UploadRun): Promise<void> {
    const { signal } = run.abort;
    try {
      const copy = run.copy ?? (await this.prepare(id, run));
      if (copy === null) {
        this.settle();
        return;
      }
      this.set(id, { kind: 'sending', progress: 0 });
      const fileId = await this.tus.upload({
        file: copy.file,
        signal,
        onProgress: (progress) => this.setProgress(id, { kind: 'sending', progress }),
      });
      run.copy = null;
      await copy.discard();
      this.set(id, { kind: 'done', fileId });
    } catch (error) {
      if (signal.aborted) {
        return;
      }
      this.set(id, isVideoTooLargeError(error) ? { kind: 'tooLarge' } : { kind: 'failed', error });
    }
    this.settle();
  }

  private async prepare(id: string, run: UploadRun): Promise<VideoCopy | null> {
    if (!isVideoFileAccepted(run.source)) {
      throw new BusinessRuleError(
        'The file type is not accepted for this file category.',
        'StoredFile.UnsupportedContent',
      );
    }
    this.set(id, { kind: 'compressing', progress: 0 });
    const copy = await this.compressor.compress({
      source: run.source,
      signal: run.abort.signal,
      onProgress: (progress) => this.setProgress(id, { kind: 'compressing', progress }),
    });
    if (run.abort.signal.aborted) {
      await copy.discard();
      return null;
    }
    if (copy.file.size > VIDEO_UPLOAD_MAX_BYTES) {
      await copy.discard();
      this.set(id, { kind: 'tooLarge' });
      return null;
    }
    run.copy = copy;
    return copy;
  }

  private settle(): void {
    for (const save of this.queue()) {
      const uploads = save.ids.map((id) => this.state()[id]);
      if (uploads.some(isLostUpload)) {
        this.removeFromQueue(save);
        void this.giveUp(save, uploads);
      } else if (uploads.every((upload) => upload?.status.kind === 'done')) {
        this.removeFromQueue(save);
        void this.send(save, uploads);
      }
    }
  }

  private async send(save: QueuedVideoSave, uploads: readonly (VideoUpload | undefined)[]) {
    const fileIds = fileIdsOf(uploads);
    for (const id of save.ids) {
      this.forget(id);
    }
    this.sending.update((sending) => [...sending, save]);
    try {
      await save.save(fileIds);
      this.finish(save, null, true);
      this.notifications.success('coachApp.videoUpload.savedBody');
    } catch (error) {
      this.finish(save, error, false);
      this.notifications.error(error);
    }
  }

  private async giveUp(save: QueuedVideoSave, uploads: readonly (VideoUpload | undefined)[]) {
    const tooLarge = uploads.some((upload) => upload?.status.kind === 'tooLarge');
    await Promise.all(save.ids.map((id) => this.cancel(id)));
    this.saveEvents.next({
      group: save.group,
      tag: save.tag ?? null,
      failure: new Error('A video of this save could not be uploaded.'),
      succeeded: false,
    });
    this.notifications.failure(
      tooLarge ? 'coachApp.day.videoTooLarge' : 'coachApp.videoUpload.saveFailed',
    );
  }

  private finish(save: QueuedVideoSave, failure: unknown, succeeded: boolean): void {
    this.sending.update((sending) => sending.filter((item) => item !== save));
    this.saveEvents.next({ group: save.group, tag: save.tag ?? null, failure, succeeded });
  }

  private removeFromQueue(save: QueuedVideoSave): void {
    this.queue.update((queue) => queue.filter((item) => item !== save));
  }

  private forget(id: string): void {
    this.runs.delete(id);
    this.state.update((uploads) => {
      const { [id]: removed, ...others } = uploads;
      return removed === undefined ? uploads : others;
    });
  }

  private setProgress(id: string, status: VideoUploadStatus & { progress: number }): void {
    if (!isSameProgress(this.state()[id]?.status, status)) {
      this.set(id, status);
    }
  }

  private set(id: string, status: VideoUploadStatus): void {
    const current = this.state()[id];
    if (current === undefined) {
      return;
    }
    const upload = { ...current, status };
    this.state.update((uploads) => ({ ...uploads, [id]: upload }));
    this.changeEvents.next(upload);
  }
}
