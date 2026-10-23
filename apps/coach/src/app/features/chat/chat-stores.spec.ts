import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NotificationService } from '@core/feedback/notification.service';
import { ChatListStore } from './chat-list.store';
import { ConversationStore } from './conversation.store';
import { Conversation, Message, Presence } from './models/chat';
import { ChatHub, ReadNotice, TypingNotice } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

const conversation = (id: string, unread = 0): Conversation => ({
  id,
  otherUserId: 'them',
  name: 'Aziz',
  photoUrl: null,
  online: false,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageText: '',
  lastMessageOn: new Date(Number(id.length)),
  unreadCount: unread,
  canWrite: true,
});
const message = (id: string, sender: string, minute: number): Message => ({
  id,
  conversationId: 'c1',
  senderUserId: sender,
  text: id,
  sentOn: new Date(2026, 9, 22, 10, minute),
});

describe('chat stores', () => {
  const service = {
    conversations: vi.fn(),
    open: vi.fn(),
    messages: vi.fn(),
    send: vi.fn(),
    markRead: vi.fn(),
  };
  const notifications = { error: vi.fn() };
  const hub = {
    messages: new Subject<Message>(),
    reads: new Subject<ReadNotice>(),
    typings: new Subject<TypingNotice>(),
    presence: new Subject<Presence>(),
    reconnected: new Subject<void>(),
    start: vi.fn(),
    typing: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service.markRead.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        ChatListStore,
        ConversationStore,
        { provide: ChatService, useValue: service },
        { provide: ChatHub, useValue: hub },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should refresh the list and update presence when the hub speaks', async () => {
    const store = TestBed.inject(ChatListStore);
    service.conversations.mockResolvedValue([conversation('a')]);
    await store.load();
    service.conversations.mockResolvedValue([conversation('a', 3)]);

    hub.messages.next(message('x', 'them', 1));
    await vi.waitFor(() => expect(store.conversations()?.[0].unreadCount).toBe(3));
    hub.presence.next({ userId: 'them', isOnline: true, lastSeen: null });

    expect(store.conversations()?.[0].online).toBe(true);
  });

  it('should open a conversation with a user and load its first page', async () => {
    const store = TestBed.inject(ConversationStore);
    service.open.mockResolvedValue({ conversationId: 'c1', canWrite: true });
    service.conversations.mockResolvedValue([
      { ...conversation('c1'), id: 'c1', name: 'Aziz Karimov' },
    ]);
    service.messages.mockResolvedValue({
      messages: [message('m1', 'them', 1)],
      otherReadUpTo: null,
    });

    await store.open({ userId: 'them', name: 'Aziz' });

    expect(store.opened()).toBe(true);
    expect(store.name()).toBe('Aziz Karimov');
    expect(store.otherUserId()).toBe('them');
    expect(service.markRead).toHaveBeenCalledWith('c1');
  });

  it('should add live messages of this conversation and ignore other ones', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    hub.messages.next(message('m1', 'them', 2));
    hub.messages.next({ ...message('m2', 'them', 3), conversationId: 'other' });

    expect(store.messages().map((item) => item.id)).toEqual(['m1']);
  });

  it('should send a trimmed message once and keep the text for retry when it fails', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });
    service.send.mockResolvedValueOnce(message('m9', 'me', 5));

    expect(await store.send('  hello ')).toBe(true);
    expect(service.send).toHaveBeenCalledWith('c1', 'hello');
    expect(store.messages()).toHaveLength(1);

    service.send.mockRejectedValueOnce(new Error('offline'));
    expect(await store.send('again')).toBe(false);
    expect(notifications.error).toHaveBeenCalledTimes(1);
    expect(await store.send('   ')).toBe(false);
  });

  it('should show typing for the other user and update the read mark', async () => {
    vi.useFakeTimers();
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    hub.typings.next({ conversationId: 'c1', userId: 'them' });
    expect(store.typing()).toBe(true);
    vi.advanceTimersByTime(5001);
    expect(store.typing()).toBe(false);

    hub.reads.next({ conversationId: 'c1', readerUserId: 'them', readUpTo: new Date(7) });
    expect(store.otherReadUpTo()).toEqual(new Date(7));
    vi.useRealTimers();
  });

  it('should load an older page when there is more history', async () => {
    const store = TestBed.inject(ConversationStore);
    const page = Array.from({ length: 50 }, (_, index) => message(`m${index}`, 'them', index));
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValueOnce({ messages: page, otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });
    service.messages.mockResolvedValueOnce({
      messages: [{ ...message('old', 'them', 0), sentOn: new Date(2020, 0, 1) }],
      otherReadUpTo: null,
    });

    await store.loadOlder();

    expect(store.messages()).toHaveLength(51);
    expect(store.hasOlder()).toBe(false);
  });
});
