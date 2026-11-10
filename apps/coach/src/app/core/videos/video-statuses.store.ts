import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { VideoDetails, VideoStreamStatus } from './video';
import { VideoStatusService } from './video-status.service';

const POLL_MS = 5000;

@Injectable()
export class VideoStatusesStore {
  private readonly service = inject(VideoStatusService);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private tracked: readonly string[] = [];

  readonly details = signal<Readonly<Record<string, VideoDetails>>>({});

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  track(fileIds: readonly string[]): Promise<void> {
    this.tracked = [...new Set(fileIds)];
    return this.refresh();
  }

  statusOf(fileId: string | null): VideoStreamStatus | null {
    return fileId === null ? null : (this.details()[fileId]?.status ?? null);
  }

  private async refresh(): Promise<void> {
    this.stop();
    if (this.tracked.length === 0) {
      return;
    }
    try {
      const read = await this.service.read(this.tracked);
      this.details.set(Object.fromEntries(read.map((item) => [item.fileId, item])));
    } catch {
      return;
    }
    if (hasPending(this.details())) {
      this.timer = setTimeout(() => void this.refresh(), POLL_MS);
    }
  }

  private stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

function hasPending(details: Readonly<Record<string, VideoDetails>>): boolean {
  return Object.values(details).some((item) => item.status === 'pending');
}
