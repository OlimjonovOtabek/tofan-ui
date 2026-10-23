import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_BASE_URL } from '@core/http/api-base-url';
import { AuthSessionStorage } from '@core/auth/auth-session.storage';
import { Message, Presence } from '../models/chat';
import { MessageResponse, PresenceEvent, ReadEvent, TypingEvent } from './chat.dto';
import { toMessage, toPresence } from './chat.mapper';

const HUB_PATH = '/hubs/chat';
const TYPING_INTERVAL_MS = 3000;

export interface ReadNotice {
  readonly conversationId: string;
  readonly readerUserId: string;
  readonly readUpTo: Date | null;
}

export interface TypingNotice {
  readonly conversationId: string;
  readonly userId: string;
}

@Injectable({ providedIn: 'root' })
export class ChatHub {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly session = inject(AuthSessionStorage);
  private connection: HubConnection | null = null;
  private readonly lastTyping = new Map<string, number>();

  readonly messages = new Subject<Message>();
  readonly reads = new Subject<ReadNotice>();
  readonly typings = new Subject<TypingNotice>();
  readonly presence = new Subject<Presence>();
  readonly reconnected = new Subject<void>();

  async start(): Promise<void> {
    if (this.session.get() === null) {
      return;
    }
    const connection = (this.connection ??= this.build());
    if (connection.state !== HubConnectionState.Disconnected) {
      return;
    }
    try {
      await connection.start();
      this.reconnected.next();
    } catch {
      return;
    }
  }

  async stop(): Promise<void> {
    if (this.connection === null || this.connection.state === HubConnectionState.Disconnected) {
      return;
    }
    try {
      await this.connection.stop();
    } catch {
      return;
    }
  }

  typing(conversationId: string): void {
    if (this.connection?.state !== HubConnectionState.Connected) {
      return;
    }
    const now = Date.now();
    if (now - (this.lastTyping.get(conversationId) ?? 0) < TYPING_INTERVAL_MS) {
      return;
    }
    this.lastTyping.set(conversationId, now);
    this.connection.send('Typing', conversationId).catch(() => undefined);
  }

  private build(): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}${HUB_PATH}`, {
        accessTokenFactory: () => this.session.get()?.accessToken ?? '',
      })
      .withAutomaticReconnect()
      .build();
    connection.on('MessageReceived', (payload: MessageResponse) =>
      this.messages.next(toMessage(payload)),
    );
    connection.on('ConversationRead', (payload: ReadEvent) => {
      if (payload.conversationId && payload.readerUserId) {
        this.reads.next({
          conversationId: payload.conversationId,
          readerUserId: payload.readerUserId,
          readUpTo: payload.readUpToUtc ? new Date(payload.readUpToUtc) : null,
        });
      }
    });
    connection.on('UserTyping', (payload: TypingEvent) => {
      if (payload.conversationId && payload.userId) {
        this.typings.next({ conversationId: payload.conversationId, userId: payload.userId });
      }
    });
    connection.on('UserPresenceChanged', (payload: PresenceEvent) => {
      const presence = toPresence(payload);
      if (presence !== null) {
        this.presence.next(presence);
      }
    });
    connection.onreconnected(() => this.reconnected.next());
    return connection;
  }
}
