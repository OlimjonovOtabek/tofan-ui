import { Injectable, signal } from '@angular/core';

@Injectable()
export class ChatPlaybackStore {
  private readonly playing = signal<string | null>(null);

  readonly active = this.playing.asReadonly();

  claim(id: string): void {
    this.playing.set(id);
  }

  release(id: string): void {
    if (this.playing() === id) {
      this.playing.set(null);
    }
  }
}
