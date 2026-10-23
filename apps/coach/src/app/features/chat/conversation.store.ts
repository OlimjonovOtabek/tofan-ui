import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { Conversation, MESSAGE_MAX_LENGTH, Message, PAGE_SIZE, mergeMessages } from './models/chat';
import { ChatHub } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

const TYPING_SHOWN_MS = 5000;

export interface ConversationTarget {
  readonly userId?: string;
  readonly conversationId?: string;
  readonly name?: string;
}

@Injectable()
export class ConversationStore {
  private readonly service = inject(ChatService);
  private readonly hub = inject(ChatHub);
  private readonly notifications = inject(NotificationService);
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  readonly conversationId = signal<string | null>(null);
  readonly otherUserId = signal('');
  readonly name = signal('');
  readonly photoUrl = signal<string | null>(null);
  readonly messages = signal<readonly Message[]>([]);
  readonly canWrite = signal(true);
  readonly otherReadUpTo = signal<Date | null>(null);
  readonly hasOlder = signal(false);
  readonly typing = signal(false);
  readonly online = signal(false);
  readonly lastSeen = signal<Date | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly sending = signal(false);
  readonly loadingOlder = signal(false);
  readonly maxLength = MESSAGE_MAX_LENGTH;

  readonly opened = computed(() => this.conversationId() !== null && !this.loading());

  constructor() {
    const destroyed = inject(DestroyRef);
    destroyed.onDestroy(() => this.clearTyping());
    this.hub.messages
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((message) => this.received(message));
    this.hub.reads.pipe(takeUntilDestroyed(destroyed)).subscribe((read) => {
      if (
        read.conversationId === this.conversationId() &&
        read.readerUserId === this.otherUserId()
      ) {
        this.otherReadUpTo.set(read.readUpTo);
      }
    });
    this.hub.typings
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((typing) => this.otherTyping(typing));
    this.hub.presence.pipe(takeUntilDestroyed(destroyed)).subscribe((presence) => {
      if (presence.userId === this.otherUserId()) {
        this.online.set(presence.isOnline);
        this.lastSeen.set(presence.lastSeen ?? this.lastSeen());
      }
    });
    this.hub.reconnected.pipe(takeUntilDestroyed(destroyed)).subscribe(() => void this.reload());
    void this.hub.start();
  }

  async open(target: ConversationTarget): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    if (target.name !== undefined) {
      this.name.set(target.name);
    }
    try {
      const id = target.conversationId ?? (await this.openWith(target.userId ?? ''));
      await this.fillDetails(id, target.userId);
      const page = await this.service.messages(id, PAGE_SIZE);
      this.conversationId.set(id);
      this.messages.set(mergeMessages(page.messages, []));
      this.otherReadUpTo.set(page.otherReadUpTo);
      this.hasOlder.set(page.messages.length >= PAGE_SIZE);
      void this.markRead();
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async loadOlder(): Promise<void> {
    const id = this.conversationId();
    const oldest = this.messages().at(-1);
    if (id === null || oldest === undefined || !this.hasOlder() || this.loadingOlder()) {
      return;
    }
    this.loadingOlder.set(true);
    try {
      const page = await this.service.messages(id, PAGE_SIZE, oldest.sentOn);
      this.messages.update((shown) => mergeMessages(page.messages, shown));
      this.hasOlder.set(page.messages.length >= PAGE_SIZE);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loadingOlder.set(false);
    }
  }

  async send(text: string): Promise<boolean> {
    const id = this.conversationId();
    const body = text.trim();
    if (id === null || body === '' || this.sending()) {
      return false;
    }
    this.sending.set(true);
    try {
      const message = await this.service.send(id, body);
      this.messages.update((shown) => mergeMessages([message], shown));
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.sending.set(false);
    }
  }

  typed(): void {
    const id = this.conversationId();
    if (id !== null && this.canWrite()) {
      this.hub.typing(id);
    }
  }

  private async openWith(userId: string): Promise<string> {
    const opened = await this.service.open(userId);
    this.canWrite.set(opened.canWrite);
    return opened.conversationId;
  }

  private async fillDetails(id: string, userId: string | undefined): Promise<void> {
    const found = (await this.service.conversations()).find((item: Conversation) => item.id === id);
    if (found === undefined) {
      this.otherUserId.set(userId ?? '');
      return;
    }
    this.otherUserId.set(found.otherUserId);
    this.name.set(found.name || this.name());
    this.photoUrl.set(found.photoUrl);
    this.canWrite.set(found.canWrite);
    this.online.set(found.online);
    this.lastSeen.set(found.lastSeen);
  }

  private received(message: Message): void {
    if (message.conversationId !== this.conversationId()) {
      return;
    }
    const fromOther = message.senderUserId === this.otherUserId();
    if (fromOther) {
      this.clearTyping();
      this.typing.set(false);
      void this.markRead();
    }
    this.messages.update((shown) => mergeMessages([message], shown));
  }

  private otherTyping(event: { conversationId: string; userId: string }): void {
    if (event.conversationId !== this.conversationId() || event.userId !== this.otherUserId()) {
      return;
    }
    this.clearTyping();
    this.typing.set(true);
    this.typingTimer = setTimeout(() => this.typing.set(false), TYPING_SHOWN_MS);
  }

  private async reload(): Promise<void> {
    const id = this.conversationId();
    if (id === null) {
      return;
    }
    try {
      const page = await this.service.messages(id, PAGE_SIZE);
      this.messages.update((shown) => mergeMessages(page.messages, shown));
      this.otherReadUpTo.set(page.otherReadUpTo ?? this.otherReadUpTo());
      void this.markRead();
    } catch {
      return;
    }
  }

  private async markRead(): Promise<void> {
    const id = this.conversationId();
    if (id === null) {
      return;
    }
    try {
      await this.service.markRead(id);
    } catch {
      return;
    }
  }

  private clearTyping(): void {
    if (this.typingTimer !== null) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }
}
