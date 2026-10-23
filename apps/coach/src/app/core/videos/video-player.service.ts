import { Injectable, signal } from '@angular/core';
import { VideoSource } from './video';

@Injectable({ providedIn: 'root' })
export class VideoPlayerService {
  private readonly current = signal<VideoSource | null>(null);

  readonly source = this.current.asReadonly();

  show(source: VideoSource): void {
    this.current.set(source);
  }

  close(): void {
    this.current.set(null);
  }
}
