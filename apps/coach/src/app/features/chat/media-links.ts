import { Message } from './models/chat';
import { isUrlFresh } from './models/chat-attachment';
import { ChatService } from './services/chat.service';

const REFRESH_COOLDOWN_MS = 60_000;
const NEARBY_MESSAGES = 20;

export type MessagePages = Pick<ChatService, 'messages'>;

export interface MediaLinksHost {
  conversationId(): string | null;
  messages(): readonly Message[];
  replace(messageId: string, fresh: readonly Message[]): void;
}

export class MediaLinks {
  private readonly refreshedAt = new Map<string, number>();
  private readonly service: MessagePages;
  private readonly host: MediaLinksHost;

  constructor(service: MessagePages, host: MediaLinksHost) {
    this.service = service;
    this.host = host;
  }

  async refresh(messageId: string): Promise<void> {
    const last = this.refreshedAt.get(messageId);
    if (last !== undefined && Date.now() - last < REFRESH_COOLDOWN_MS) {
      return;
    }
    await this.fetchAround(messageId);
  }

  async freshUrl(messageId: string, fileId: string): Promise<string | null> {
    const url = this.urlOf(messageId, fileId);
    if (url !== null && isUrlFresh(url, new Date())) {
      return url;
    }
    await this.fetchAround(messageId);
    return this.urlOf(messageId, fileId);
  }

  private async fetchAround(messageId: string): Promise<void> {
    const conversationId = this.host.conversationId();
    const message = this.host.messages().find((item) => item.id === messageId);
    if (conversationId === null || message === undefined) {
      return;
    }
    this.refreshedAt.set(messageId, Date.now());
    try {
      const page = await this.service.messages(
        conversationId,
        NEARBY_MESSAGES,
        new Date(message.sentOn.getTime() + 1),
      );
      this.host.replace(messageId, page.messages);
    } catch {
      keepTheOldLinksWhenTheRefreshFails();
    }
  }

  private urlOf(messageId: string, fileId: string): string | null {
    const message = this.host.messages().find((item) => item.id === messageId);
    return message?.attachments.find((attachment) => attachment.fileId === fileId)?.url ?? null;
  }
}

function keepTheOldLinksWhenTheRefreshFails(): void {
  return;
}
