import { computed, signal } from '@angular/core';
import { ActivityBoard } from './activity-board';
import { Conversation, Presence } from './models/chat';
import { ActivityNotice } from './models/chat-activity';
import { ReadNotice } from './services/chat-hub.service';

const PEER = 'peer';

export class ConversationPeer {
  private readonly board = new ActivityBoard();

  readonly userId = signal('');
  readonly name = signal('');
  readonly photoUrl = signal<string | null>(null);
  readonly online = signal(false);
  readonly lastSeen = signal<Date | null>(null);
  readonly readUpTo = signal<Date | null>(null);
  readonly activity = computed(() => this.board.activities().get(PEER) ?? null);

  fill(found: Conversation | undefined, userId: string | undefined): void {
    if (found === undefined) {
      this.userId.set(userId ?? '');
      return;
    }
    this.userId.set(found.otherUserId);
    this.name.set(found.name || this.name());
    this.photoUrl.set(found.photoUrl);
    this.online.set(found.online);
    this.lastSeen.set(found.lastSeen);
  }

  presence(presence: Presence): void {
    if (presence.userId === this.userId()) {
      this.online.set(presence.isOnline);
      this.lastSeen.set(presence.lastSeen ?? this.lastSeen());
    }
  }

  read(notice: ReadNotice, conversationId: string | null): void {
    if (notice.conversationId === conversationId && notice.readerUserId === this.userId()) {
      this.readUpTo.set(notice.readUpTo);
    }
  }

  noticed(notice: ActivityNotice, conversationId: string | null): void {
    if (notice.conversationId === conversationId && notice.userId === this.userId()) {
      this.board.show(PEER, notice.activity);
    }
  }

  clearActivity(): void {
    this.board.clear(PEER);
  }

  dispose(): void {
    this.board.dispose();
  }
}
