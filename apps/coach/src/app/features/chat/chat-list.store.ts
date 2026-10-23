import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import {
  ChatFilter,
  Conversation,
  applyPresence,
  filterConversations,
  newestFirst,
} from './models/chat';
import { ChatHub } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

@Injectable()
export class ChatListStore {
  private readonly service = inject(ChatService);
  private readonly hub = inject(ChatHub);
  private readonly notifications = inject(NotificationService);

  readonly conversations = signal<readonly Conversation[] | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly filter = signal<ChatFilter>('all');
  readonly query = signal('');
  readonly now = signal(new Date());

  readonly visible = computed(() =>
    filterConversations(this.conversations() ?? [], this.filter(), this.query()),
  );

  constructor() {
    merge(this.hub.messages, this.hub.reads, this.hub.reconnected)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => void this.refreshQuietly());
    this.hub.presence.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((presence) => {
      this.conversations.update((list) => (list === null ? list : applyPresence(list, presence)));
    });
    void this.hub.start();
  }

  async load(): Promise<void> {
    this.loadError.set(null);
    this.now.set(new Date());
    const hadData = this.conversations() !== null;
    try {
      this.conversations.set(newestFirst(await this.service.conversations()));
    } catch (error) {
      if (hadData) {
        this.notifications.error(error);
      } else {
        this.loadError.set(toErrorMessage(error));
      }
    }
  }

  private async refreshQuietly(): Promise<void> {
    if (this.conversations() === null) {
      return;
    }
    try {
      this.now.set(new Date());
      this.conversations.set(newestFirst(await this.service.conversations()));
    } catch {
      return;
    }
  }
}
