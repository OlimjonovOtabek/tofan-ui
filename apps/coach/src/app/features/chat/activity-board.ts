import { signal } from '@angular/core';
import { ACTIVITY_SHOWN_MS, ChatActivity } from './models/chat-activity';

export class ActivityBoard {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly shown = signal<ReadonlyMap<string, ChatActivity>>(new Map());

  readonly activities = this.shown.asReadonly();

  show(key: string, activity: ChatActivity): void {
    this.stopTimer(key);
    this.shown.update((current) => new Map(current).set(key, activity));
    this.timers.set(
      key,
      setTimeout(() => this.clear(key), ACTIVITY_SHOWN_MS),
    );
  }

  clear(key: string): void {
    this.stopTimer(key);
    if (!this.shown().has(key)) {
      return;
    }
    this.shown.update((current) => {
      const next = new Map(current);
      next.delete(key);
      return next;
    });
  }

  dispose(): void {
    for (const key of this.timers.keys()) {
      this.stopTimer(key);
    }
  }

  private stopTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
}
