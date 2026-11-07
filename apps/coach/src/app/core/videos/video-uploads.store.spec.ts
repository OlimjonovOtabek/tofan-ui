import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { TusUploadService } from './tus-upload.service';
import { VideoCompressorService } from './video-compressor.service';
import { VideoUploadSaveResult } from './video-upload';
import { VideoUploadsStore } from './video-uploads.store';

const target = { group: 'g', link: '/g' };

describe('VideoUploadsStore', () => {
  const upload = vi.fn();
  const compress = vi.fn();
  const notifications = { success: vi.fn(), error: vi.fn(), failure: vi.fn() };
  const file = new File(['x'], 'squat.mp4');
  let store: VideoUploadsStore;
  let results: VideoUploadSaveResult[];
  const settled = () => new Promise<void>((resolve) => setTimeout(resolve));

  beforeEach(() => {
    vi.resetAllMocks();
    results = [];
    compress.mockImplementation(({ source }: { source: File }) =>
      Promise.resolve({ file: source, discard: () => Promise.resolve() }),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: TusUploadService, useValue: { upload } },
        { provide: VideoCompressorService, useValue: { compress } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(VideoUploadsStore);
    store.saves$.subscribe((result) => results.push(result));
  });

  it('should keep the file id once the upload is done', async () => {
    upload.mockResolvedValue('f1');

    const id = store.start(file, target);
    await settled();

    expect(store.uploads()[id].status).toEqual({ kind: 'done', fileId: 'f1' });
    expect(store.busy()).toBe(false);
  });

  it('should send a queued save once all its videos are stored', async () => {
    let finish: (id: string) => void = () => undefined;
    upload.mockReturnValue(new Promise<string>((resolve) => (finish = resolve)));
    const save = vi.fn().mockResolvedValue(undefined);
    const id = store.start(file, target);

    store.saveWhenUploaded({ ...target, ids: [id], tag: 'p1', save });
    await settled();
    expect(save).not.toHaveBeenCalled();
    expect(store.busy()).toBe(true);
    finish('f1');
    await settled();

    expect(save).toHaveBeenCalledExactlyOnceWith({ [id]: 'f1' });
    expect(results).toEqual([{ group: 'g', tag: 'p1', failure: null, succeeded: true }]);
    expect(store.uploads()[id]).toBeUndefined();
    expect(store.busy()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('coachApp.videoUpload.savedBody');
  });

  it('should send a save at once when its videos are already stored', async () => {
    upload.mockResolvedValue('f1');
    const save = vi.fn().mockResolvedValue(undefined);
    const id = store.start(file, target);
    await settled();

    store.saveWhenUploaded({ ...target, ids: [id], save });
    await settled();

    expect(save).toHaveBeenCalledWith({ [id]: 'f1' });
  });

  it('should give up the save when one of its videos fails', async () => {
    upload.mockRejectedValue(new Error('offline'));
    const save = vi.fn();
    const id = store.start(file, target);

    store.saveWhenUploaded({ ...target, ids: [id], save });
    await settled();

    expect(save).not.toHaveBeenCalled();
    expect(results[0].succeeded).toBe(false);
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.videoUpload.saveFailed');
    expect(store.busy()).toBe(false);
  });

  it('should report a save the server refused', async () => {
    upload.mockResolvedValue('f1');
    const failure = new Error('refused');
    const id = store.start(file, target);

    store.saveWhenUploaded({ ...target, ids: [id], save: () => Promise.reject(failure) });
    await settled();

    expect(results[0]).toMatchObject({ succeeded: false, failure });
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should mark the upload too large when even the copy is over the limit', async () => {
    const huge = new File(['x'], 'squat.mp4');
    Object.defineProperty(huge, 'size', { value: 2 * 1024 * 1024 * 1024 });
    const discard = vi.fn().mockResolvedValue(undefined);
    compress.mockResolvedValue({ file: huge, discard });

    const id = store.start(file, target);
    await settled();

    expect(store.uploads()[id].status).toEqual({ kind: 'tooLarge' });
    expect(discard).toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('should mark the upload too large when the server refuses its size', async () => {
    upload.mockRejectedValue({ code: 'StoredFile.TooLarge' });

    const id = store.start(file, target);
    await settled();

    expect(store.uploads()[id].status).toEqual({ kind: 'tooLarge' });
  });

  it('should refuse a file type the server does not take', async () => {
    const id = store.start(new File(['x'], 'photo.png'), target);
    await settled();

    expect(store.uploads()[id].status.kind).toBe('failed');
    expect(compress).not.toHaveBeenCalled();
  });

  it('should send again from the same copy on retry', async () => {
    upload.mockRejectedValueOnce(new Error('offline')).mockResolvedValue('f1');
    const id = store.start(file, target);
    await settled();

    store.retry(id);
    await settled();

    expect(store.uploads()[id].status).toEqual({ kind: 'done', fileId: 'f1' });
    expect(compress).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('should stop and forget a cancelled upload', async () => {
    upload.mockReturnValue(new Promise<string>(() => undefined));
    const id = store.start(file, target);
    await settled();
    const { signal } = upload.mock.calls[0][0] as { signal: AbortSignal };

    await store.cancel(id);

    expect(signal.aborted).toBe(true);
    expect(store.uploads()[id]).toBeUndefined();
    expect(store.busy()).toBe(false);
  });

  it('should tell the progress of a group until its save is sent', async () => {
    let finish: (id: string) => void = () => undefined;
    upload.mockReturnValue(new Promise<string>((resolve) => (finish = resolve)));
    const id = store.start(file, target);
    await settled();
    expect(store.progressIn('g')).toBe(0);
    expect(store.progressIn('other')).toBeNull();

    let sent: () => void = () => undefined;
    store.saveWhenUploaded({
      ...target,
      ids: [id],
      save: () => new Promise<void>((resolve) => (sent = resolve)),
    });
    finish('f1');
    await settled();
    expect(store.progressIn('g')).toBe(1);
    sent();
    await settled();

    expect(store.progressIn('g')).toBeNull();
  });
});
