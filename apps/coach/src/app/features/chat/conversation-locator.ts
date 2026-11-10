import { Conversation } from './models/chat';
import { ChatService } from './services/chat.service';

export interface ConversationTarget {
  readonly userId?: string;
  readonly conversationId?: string;
  readonly name?: string;
}

export type ConversationDirectory = Pick<ChatService, 'open' | 'conversations'>;

export interface LocatedConversation {
  readonly id: string;
  readonly canWrite: boolean | null;
  readonly found: Conversation | undefined;
}

export async function locateConversation(
  service: ConversationDirectory,
  target: ConversationTarget,
): Promise<LocatedConversation> {
  const opened =
    target.conversationId === undefined ? await service.open(target.userId ?? '') : null;
  const id = target.conversationId ?? opened?.conversationId ?? '';
  const found = (await service.conversations()).find((item) => item.id === id);
  return { id, canWrite: found?.canWrite ?? opened?.canWrite ?? null, found };
}
