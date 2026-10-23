import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Conversation, Message } from '../models/chat';
import {
  ConversationMessagesResponse,
  ConversationResponse,
  MessageResponse,
  OpenConversationResponse,
} from './chat.dto';
import { toConversation, toMessage } from './chat.mapper';

const CHAT = '/chat/conversations';

export interface MessagesPage {
  readonly messages: readonly Message[];
  readonly otherReadUpTo: Date | null;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiClient);

  async conversations(): Promise<Conversation[]> {
    const responses = await this.api.get<ConversationResponse[]>(CHAT);
    return responses.map((response) => toConversation(response, (path) => this.api.url(path)));
  }

  open(userId: string): Promise<OpenConversationResponse> {
    return this.api.post<OpenConversationResponse>(`${CHAT}/with/${encodeURIComponent(userId)}`);
  }

  async messages(conversationId: string, limit: number, before?: Date): Promise<MessagesPage> {
    const response = await this.api.get<ConversationMessagesResponse>(
      `${CHAT}/${encodeURIComponent(conversationId)}/messages`,
      {
        Limit: limit,
        Before: before?.toISOString(),
      },
    );
    return {
      messages: (response.messages ?? []).map(toMessage),
      otherReadUpTo:
        response.otherReadUpToUtc === null ? null : new Date(response.otherReadUpToUtc),
    };
  }

  async send(conversationId: string, text: string): Promise<Message> {
    return toMessage(
      await this.api.post<MessageResponse>(
        `${CHAT}/${encodeURIComponent(conversationId)}/messages`,
        { text },
      ),
    );
  }

  async markRead(conversationId: string): Promise<void> {
    await this.api.post(`${CHAT}/${encodeURIComponent(conversationId)}/read`);
  }
}
