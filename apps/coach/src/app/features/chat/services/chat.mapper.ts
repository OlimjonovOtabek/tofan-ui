import { toDateOrNull } from '@coach/core/payments/payment.mapper';
import { Conversation, Message, Presence } from '../models/chat';
import { ConversationResponse, MessageResponse, PresenceEvent } from './chat.dto';

export function toConversation(
  response: ConversationResponse,
  photoUrlOf: (path: string) => string,
): Conversation {
  return {
    id: response.id,
    otherUserId: response.otherUserId,
    name: response.otherUserName?.trim() ?? '',
    photoUrl: response.otherUserPhotoUrl ? photoUrlOf(response.otherUserPhotoUrl) : null,
    online: response.otherIsOnline,
    lastSeen: toDateOrNull(response.otherLastSeenOnUtc),
    otherReadUpTo: toDateOrNull(response.otherReadUpToUtc),
    lastMessageSenderId: response.lastMessageSenderUserId,
    lastMessageText: response.lastMessageText?.trim() ?? '',
    lastMessageOn: toDateOrNull(response.lastMessageOnUtc),
    unreadCount: response.unreadCount,
    canWrite: response.canWrite,
  };
}

export function toMessage(response: MessageResponse): Message {
  return {
    id: response.id,
    conversationId: response.conversationId,
    senderUserId: response.senderUserId,
    text: response.text ?? '',
    sentOn: new Date(response.sentOnUtc),
  };
}

export function toPresence(event: PresenceEvent): Presence | null {
  return event.userId
    ? {
        userId: event.userId,
        isOnline: event.isOnline === true,
        lastSeen: toDateOrNull(event.lastSeenOnUtc),
      }
    : null;
}
