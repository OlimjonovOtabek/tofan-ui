import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { MediaStore } from './media.store';
import { StoredFile } from './models/stored-file';
import { MediaService } from './services/media.service';

describe('MediaStore', () => {
  const video = new StoredFile(
    'video',
    'exerciseVideo',
    'squat.mp4',
    'video/mp4',
    10,
    new Date(),
    null,
  );

  let service: Pick<MediaService, 'list' | 'delete'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): MediaStore {
    TestBed.configureTestingModule({
      providers: [
        MediaStore,
        { provide: MediaService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(MediaStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [video], totalCount: 1 }),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.files()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('should keep the list and show the reason when the file is still in use', async () => {
    const store = createStore();
    await store.load();
    const inUse = new ConflictError('in use', 'StoredFile.InUse');
    vi.mocked(service.delete).mockRejectedValue(inUse);

    await store.remove(video);

    expect(notifications.error).toHaveBeenCalledWith(inUse);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.deletingId()).toBeNull();
  });

  it('should refresh the list when the file was already deleted', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.delete).mockRejectedValue(new NotFoundError('gone', 'StoredFile.NotFound'));

    await store.remove(video);

    expect(service.list).toHaveBeenCalledTimes(2);
  });
});
