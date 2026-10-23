export interface ConversationResponse {
  id: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserPhotoUrl: string | null;
  otherIsOnline: boolean;
  otherLastSeenOnUtc: string | null;
  otherReadUpToUtc: string | null;
  lastMessageSenderUserId: string | null;
  lastMessageText: string | null;
  lastMessageOnUtc: string | null;
  unreadCount: number;
  canWrite: boolean;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderUserId: string;
  text: string;
  sentOnUtc: string;
}

export interface ConversationMessagesResponse {
  conversationId: string;
  otherReadUpToUtc: string | null;
  messages: MessageResponse[] | null;
}

export interface OpenConversationResponse {
  conversationId: string;
  canWrite: boolean;
}

export interface PresenceEvent {
  userId?: string;
  isOnline?: boolean;
  lastSeenOnUtc?: string | null;
}

export interface ReadEvent {
  conversationId?: string;
  readerUserId?: string;
  readUpToUtc?: string | null;
}

export interface TypingEvent {
  conversationId?: string;
  userId?: string;
}
