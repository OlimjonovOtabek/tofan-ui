import { MediaLinks, MediaLinksHost, MessagePages } from './media-links';
import { Message } from './models/chat';

const NOW = new Date('2026-11-09T10:00:00Z');
const urlExpiringIn = (seconds: number) =>
  `/api/files/f1/content?expires=${NOW.getTime() / 1000 + seconds}&signature=s`;
const withUrl = (url: string): Message => ({
  id: 'm1',
  conversationId: 'c1',
  senderUserId: 'them',
  kind: 'file',
  text: '',
  attachments: [
    {
      fileId: 'f1',
      url,
      fileName: 'plan.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
      durationSeconds: null,
      width: null,
      height: null,
      waveform: [],
    },
  ],
  sentOn: new Date('2026-11-09T09:00:00Z'),
});

describe('MediaLinks', () => {
  let shown: Message[];
  const service = { messages: vi.fn<MessagePages['messages']>() };
  const host: MediaLinksHost = {
    conversationId: () => 'c1',
    messages: () => shown,
    replace: (_, fresh) => (shown = [...fresh]),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    service.messages.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  function links(): MediaLinks {
    return new MediaLinks(service, host);
  }

  it('should return a fresh url without asking the backend', async () => {
    shown = [withUrl(urlExpiringIn(3600))];

    expect(await links().freshUrl('m1', 'f1')).toBe(urlExpiringIn(3600));
    expect(service.messages).not.toHaveBeenCalled();
  });

  it('should refetch the page around the message when the url has expired', async () => {
    shown = [withUrl(urlExpiringIn(-10))];
    service.messages.mockResolvedValue({
      messages: [withUrl(urlExpiringIn(3600))],
      otherReadUpTo: null,
    });

    expect(await links().freshUrl('m1', 'f1')).toBe(urlExpiringIn(3600));
    expect(service.messages).toHaveBeenCalledWith('c1', 20, new Date('2026-11-09T09:00:00.001Z'));
  });

  it('should refresh one message at most once a minute', async () => {
    shown = [withUrl(urlExpiringIn(3600))];
    service.messages.mockResolvedValue({ messages: shown, otherReadUpTo: null });
    const media = links();

    await media.refresh('m1');
    await media.refresh('m1');
    vi.advanceTimersByTime(60_000);
    await media.refresh('m1');

    expect(service.messages).toHaveBeenCalledTimes(2);
  });
});
