import { TestBed } from '@angular/core/testing';
import { VideoStatusService } from './video-status.service';
import { VideoStatusesStore } from './video-statuses.store';

describe('VideoStatusesStore', () => {
  const service = { read: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [VideoStatusesStore, { provide: VideoStatusService, useValue: service }],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('should read each tracked video once and tell its status', async () => {
    service.read.mockResolvedValue([{ fileId: 'a', status: 'ready', durationSeconds: 3 }]);
    const store = TestBed.inject(VideoStatusesStore);

    await store.track(['a', 'a']);

    expect(service.read).toHaveBeenCalledWith(['a']);
    expect(store.statusOf('a')).toBe('ready');
    expect(store.statusOf('b')).toBeNull();
    expect(store.statusOf(null)).toBeNull();
  });

  it('should read again while a video is still being processed', async () => {
    service.read.mockResolvedValueOnce([{ fileId: 'a', status: 'pending', durationSeconds: null }]);
    service.read.mockResolvedValueOnce([{ fileId: 'a', status: 'ready', durationSeconds: 3 }]);
    const store = TestBed.inject(VideoStatusesStore);

    await store.track(['a']);
    await vi.advanceTimersByTimeAsync(5000);

    expect(service.read).toHaveBeenCalledTimes(2);
    expect(store.statusOf('a')).toBe('ready');
    await vi.advanceTimersByTimeAsync(5000);
    expect(service.read).toHaveBeenCalledTimes(2);
  });

  it('should not read anything when no video is tracked', async () => {
    const store = TestBed.inject(VideoStatusesStore);

    await store.track([]);

    expect(service.read).not.toHaveBeenCalled();
  });
});
