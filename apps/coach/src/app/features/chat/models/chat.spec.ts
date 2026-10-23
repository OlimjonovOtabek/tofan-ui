import {
  Conversation,
  Message,
  applyPresence,
  chatInitials,
  filterConversations,
  isMine,
  isRead,
  mergeMessages,
  newestFirst,
  opensDay,
} from './chat';

const conversation = (
  id: string,
  name: string,
  unread: number,
  on: number | null,
): Conversation => ({
  id,
  otherUserId: `u-${id}`,
  name,
  photoUrl: null,
  online: false,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageText: '',
  lastMessageOn: on === null ? null : new Date(on),
  unreadCount: unread,
  canWrite: true,
});
const message = (id: string, sender: string, at: string): Message => ({
  id,
  conversationId: 'c',
  senderUserId: sender,
  text: id,
  sentOn: new Date(at),
});

describe('conversation rules', () => {
  const list = [
    conversation('a', 'Aziz', 0, 100),
    conversation('b', 'Bobur', 2, 300),
    conversation('c', 'Lola', 0, null),
  ];

  it('should list the newest conversation first and chats without messages last', () => {
    expect(newestFirst(list).map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('should filter by read state and by name', () => {
    expect(filterConversations(list, 'unread', '').map((item) => item.id)).toEqual(['b']);
    expect(filterConversations(list, 'read', 'LO').map((item) => item.id)).toEqual(['c']);
  });

  it('should update only the matching user on a presence event', () => {
    const next = applyPresence(list, { userId: 'u-a', isOnline: true, lastSeen: new Date(5) });

    expect(next[0]).toMatchObject({ online: true, lastSeen: new Date(5) });
    expect(next[1].online).toBe(false);
  });
});

describe('message rules', () => {
  it('should merge without duplicates and sort newest first', () => {
    const a = message('a', 'me', '2026-10-22T10:00:00Z');
    const b = message('b', 'them', '2026-10-22T11:00:00Z');

    expect(mergeMessages([b], [a, b]).map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('should know who wrote it and whether the other side read it', () => {
    const sent = message('a', 'me', '2026-10-22T10:00:00Z');

    expect(isMine(sent, 'them')).toBe(true);
    expect(isRead(sent, new Date('2026-10-22T10:00:00Z'))).toBe(true);
    expect(isRead(sent, new Date('2026-10-22T09:00:00Z'))).toBe(false);
    expect(isRead(sent, null)).toBe(false);
  });

  it('should open a day separator when the older message is from another day', () => {
    const list = [
      message('3', 'a', '2026-10-22T10:00:00'),
      message('2', 'a', '2026-10-22T08:00:00'),
      message('1', 'a', '2026-10-21T20:00:00'),
    ];

    expect([0, 1, 2].map((index) => opensDay(list, index))).toEqual([false, true, true]);
  });
});

describe('chatInitials', () => {
  it('should use two letters for one word and first plus last for several', () => {
    expect(chatInitials('aziz')).toBe('AZ');
    expect(chatInitials(' Aziz  Karim  Rahimov ')).toBe('AR');
    expect(chatInitials('')).toBe('');
  });
});
