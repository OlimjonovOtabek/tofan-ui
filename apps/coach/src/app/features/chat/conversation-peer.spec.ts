import { ConversationPeer } from './conversation-peer';
import { Conversation } from './models/chat';

const found: Conversation = {
  id: 'c1',
  otherUserId: 'them',
  name: '',
  photoUrl: '/photo.jpg',
  online: true,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageKind: null,
  lastMessageText: '',
  lastMessageOn: null,
  unreadCount: 0,
  canWrite: true,
};

describe('ConversationPeer', () => {
  it('should fall back to the target user and keep the known name', () => {
    const peer = new ConversationPeer();
    peer.name.set('Aziz');

    peer.fill(undefined, 'u1');
    expect(peer.userId()).toBe('u1');
    peer.fill(found, 'u1');

    expect(peer.userId()).toBe('them');
    expect(peer.name()).toBe('Aziz');
    expect(peer.online()).toBe(true);
  });

  it('should take reads and activity only from this conversation and this user', () => {
    const peer = new ConversationPeer();
    peer.fill(found, undefined);

    peer.read({ conversationId: 'other', readerUserId: 'them', readUpTo: new Date(1) }, 'c1');
    peer.read({ conversationId: 'c1', readerUserId: 'me', readUpTo: new Date(2) }, 'c1');
    peer.noticed({ conversationId: 'c1', userId: 'stranger', activity: 'typing' }, 'c1');
    expect(peer.readUpTo()).toBeNull();
    expect(peer.activity()).toBeNull();

    peer.read({ conversationId: 'c1', readerUserId: 'them', readUpTo: new Date(3) }, 'c1');
    peer.noticed({ conversationId: 'c1', userId: 'them', activity: 'uploading' }, 'c1');

    expect(peer.readUpTo()).toEqual(new Date(3));
    expect(peer.activity()).toBe('uploading');
    peer.dispose();
  });

  it('should follow presence of the same user only', () => {
    const peer = new ConversationPeer();
    peer.fill({ ...found, online: false }, undefined);

    peer.presence({ userId: 'stranger', isOnline: true, lastSeen: null });
    expect(peer.online()).toBe(false);
    peer.presence({ userId: 'them', isOnline: true, lastSeen: new Date(5) });

    expect(peer.online()).toBe(true);
    expect(peer.lastSeen()).toEqual(new Date(5));
  });
});
