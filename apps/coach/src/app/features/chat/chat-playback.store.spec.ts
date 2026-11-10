import { ChatPlaybackStore } from './chat-playback.store';

describe('ChatPlaybackStore', () => {
  it('should let the latest claim win', () => {
    const playback = new ChatPlaybackStore();

    playback.claim('a');
    playback.claim('b');

    expect(playback.active()).toBe('b');
  });

  it('should clear only when the active player releases', () => {
    const playback = new ChatPlaybackStore();
    playback.claim('a');

    playback.release('b');
    expect(playback.active()).toBe('a');
    playback.release('a');
    expect(playback.active()).toBeNull();
  });
});
