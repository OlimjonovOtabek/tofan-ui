import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoCollectionSummary } from './models/video-collection';
import { VideoCollectionsService } from './services/video-collections.service';
import { VideoCollectionsStore } from './video-collections.store';

function summary(id: string): VideoCollectionSummary {
  return { id, title: id, description: '', isPublished: false, videoCount: 0 };
}

describe('VideoCollectionsStore', () => {
  const service = { list: vi.fn(), create: vi.fn(), reorder: vi.fn() };
  const notifications = { error: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        VideoCollectionsStore,
        { provide: VideoCollectionsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should show the collections and room for more when loaded', async () => {
    service.list.mockResolvedValue([summary('a')]);
    const store = TestBed.inject(VideoCollectionsStore);

    await store.load();

    expect(store.collections()).toEqual([summary('a')]);
    expect(store.hasRoom()).toBe(true);
  });

  it('should have no room once there are 20 collections', async () => {
    service.list.mockResolvedValue(Array.from({ length: 20 }, (_, i) => summary(`c${i}`)));
    const store = TestBed.inject(VideoCollectionsStore);

    await store.load();

    expect(store.hasRoom()).toBe(false);
  });

  it('should return the new id when a collection is created', async () => {
    service.create.mockResolvedValue('c9');
    const store = TestBed.inject(VideoCollectionsStore);

    expect(await store.create({ title: 'Grija', text: '' })).toBe('c9');
    expect(service.create).toHaveBeenCalledWith({ title: 'Grija', text: '' });
    expect(store.creating()).toBe(false);
  });

  it('should say why and return no id when creating fails', async () => {
    const failure = new Error('limit');
    service.create.mockRejectedValue(failure);
    const store = TestBed.inject(VideoCollectionsStore);

    expect(await store.create({ title: 'Grija', text: '' })).toBeNull();
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should send the whole new order when a collection is moved', async () => {
    service.list.mockResolvedValue([summary('a'), summary('b'), summary('c')]);
    service.reorder.mockResolvedValue(undefined);
    const store = TestBed.inject(VideoCollectionsStore);
    await store.load();

    await store.reorder(0, 2);

    expect(service.reorder).toHaveBeenCalledWith(['b', 'c', 'a']);
    expect(store.collections()?.map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('should restore the order when saving it fails', async () => {
    service.list.mockResolvedValue([summary('a'), summary('b')]);
    service.reorder.mockRejectedValue(new Error('mismatch'));
    const store = TestBed.inject(VideoCollectionsStore);
    await store.load();

    await store.reorder(0, 1);

    expect(store.collections()?.map((c) => c.id)).toEqual(['a', 'b']);
    expect(notifications.error).toHaveBeenCalled();
  });
});
