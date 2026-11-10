import { ConversationDirectory, locateConversation } from './conversation-locator';
import { Conversation } from './models/chat';

const listed = (id: string, canWrite: boolean): Conversation => ({
  id,
  otherUserId: 'them',
  name: 'Aziz',
  photoUrl: null,
  online: false,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageKind: null,
  lastMessageText: '',
  lastMessageOn: null,
  unreadCount: 0,
  canWrite,
});

function directoryWith(conversations: Conversation[]) {
  return {
    open: vi.fn<ConversationDirectory['open']>(() =>
      Promise.resolve({ conversationId: 'c-new', canWrite: false }),
    ),
    conversations: vi.fn<ConversationDirectory['conversations']>(() =>
      Promise.resolve(conversations),
    ),
  };
}

describe('locateConversation', () => {
  it('should open a conversation with the user when no id is given', async () => {
    const directory = directoryWith([]);

    const located = await locateConversation(directory, { userId: 'u1' });

    expect(directory.open).toHaveBeenCalledWith('u1');
    expect(located).toEqual({ id: 'c-new', canWrite: false, found: undefined });
  });

  it('should prefer the write access from the list when the conversation is listed', async () => {
    const directory = directoryWith([listed('c1', true)]);

    const located = await locateConversation(directory, { conversationId: 'c1' });

    expect(directory.open).not.toHaveBeenCalled();
    expect(located.canWrite).toBe(true);
  });

  it('should leave write access unknown when the given conversation is not listed', async () => {
    const located = await locateConversation(directoryWith([]), { conversationId: 'c1' });

    expect(located.canWrite).toBeNull();
  });
});
