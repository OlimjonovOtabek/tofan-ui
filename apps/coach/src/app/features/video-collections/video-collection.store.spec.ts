import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VideoUploadSaveResult } from '@coach/core/videos/video-upload';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { Subject } from 'rxjs';
import { CollectionVideo, VideoCollection } from './models/video-collection';
import { VideoCollectionsService } from './services/video-collections.service';
import { VideoCollectionStore } from './video-collection.store';

function video(id: string): CollectionVideo {
  return {
    id,
    fileId: `f-${id}`,
    title: '',
    note: '',
    videoUrl: null,
    hlsUrl: null,
    posterUrl: null,
  };
}

function collection(videos: CollectionVideo[], isPublished = false): VideoCollection {
  return { id: 'c1', title: 'Grija', description: '', isPublished, videos };
}

describe('VideoCollectionStore', () => {
  const service = {
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setPublished: vi.fn(),
    addVideo: vi.fn(),
    updateVideo: vi.fn(),
    deleteVideo: vi.fn(),
    reorderVideos: vi.fn(),
  };
  const statuses = { track: vi.fn() };
  const uploads = {
    start: vi.fn(),
    saveWhenUploaded: vi.fn(),
    saves$: new Subject<VideoUploadSaveResult>(),
    progressIn: vi.fn(),
    preparingIn: vi.fn(),
  };
  const notifications = { success: vi.fn(), failure: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    statuses.track.mockResolvedValue(undefined);
    uploads.progressIn.mockReturnValue(null);
    uploads.preparingIn.mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [
        VideoCollectionStore,
        { provide: VideoCollectionsService, useValue: service },
        { provide: VideoStatusesStore, useValue: statuses },
        { provide: VideoUploadsStore, useValue: uploads },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  async function loaded(value: VideoCollection): Promise<VideoCollectionStore> {
    service.get.mockResolvedValue(value);
    const store = TestBed.inject(VideoCollectionStore);
    await store.load('c1');
    return store;
  }

  it('should show the collection and watch its videos when loaded', async () => {
    const store = await loaded(collection([video('a')]));

    expect(store.collection()?.videos).toHaveLength(1);
    expect(statuses.track).toHaveBeenCalledWith(['f-a']);
    expect(store.uploadProgress()).toBeNull();
    expect(uploads.progressIn).toHaveBeenCalledWith('video-collection:c1');
  });

  it('should not publish a collection without videos', async () => {
    const store = await loaded(collection([]));

    expect(await store.togglePublished()).toBe(false);

    expect(service.setPublished).not.toHaveBeenCalled();
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.videoCollections.publishEmpty');
  });

  it('should publish a draft with videos and read it again', async () => {
    const store = await loaded(collection([video('a')]));
    service.setPublished.mockResolvedValue(undefined);
    service.get.mockResolvedValue(collection([video('a')], true));

    expect(await store.togglePublished()).toBe(true);

    expect(service.setPublished).toHaveBeenCalledWith('c1', true);
    expect(store.collection()?.isPublished).toBe(true);
    expect(notifications.success).toHaveBeenCalledWith(
      'coachApp.videoCollections.publishedMessage',
    );
  });

  it('should move a published collection back to drafts', async () => {
    const store = await loaded(collection([video('a')], true));
    service.setPublished.mockResolvedValue(undefined);

    await store.togglePublished();

    expect(service.setPublished).toHaveBeenCalledWith('c1', false);
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it('should add a video to the collection once it is uploaded', async () => {
    const store = await loaded(collection([]));
    uploads.start.mockReturnValue('u1');
    service.addVideo.mockResolvedValue('v1');
    const file = new File(['x'], 'a.mp4');

    store.addVideo(file);

    expect(uploads.start).toHaveBeenCalledWith(file, {
      group: 'video-collection:c1',
      link: '/profile/video-collections/c1',
    });
    const queued = uploads.saveWhenUploaded.mock.calls[0][0] as {
      save(fileIds: Record<string, string>): Promise<unknown>;
    };
    await queued.save({ u1: 'f1' });
    expect(service.addVideo).toHaveBeenCalledWith('c1', 'f1');
  });

  it('should not add a video when the collection holds 50', async () => {
    const store = await loaded(collection(Array.from({ length: 50 }, (_, i) => video(`v${i}`))));

    store.addVideo(new File(['x'], 'a.mp4'));

    expect(uploads.start).not.toHaveBeenCalled();
  });

  it('should read the collection again when its queued video was saved', async () => {
    await loaded(collection([]));
    service.get.mockClear();
    service.get.mockResolvedValue(collection([video('a')]));

    uploads.saves$.next({
      group: 'video-collection:c1',
      tag: 'c1',
      failure: null,
      succeeded: true,
    });

    await vi.waitFor(() => expect(service.get).toHaveBeenCalledWith('c1'));
  });

  it('should send the new video order and restore it when that fails', async () => {
    const store = await loaded(collection([video('a'), video('b')]));
    service.reorderVideos.mockRejectedValue(new Error('mismatch'));

    await store.reorder(0, 1);

    expect(service.reorderVideos).toHaveBeenCalledWith('c1', ['b', 'a']);
    expect(store.collection()?.videos.map((v) => v.id)).toEqual(['a', 'b']);
    expect(store.busy()).toBe(false);
  });

  it('should delete the collection without reading it again', async () => {
    const store = await loaded(collection([]));
    service.get.mockClear();
    service.delete.mockResolvedValue(undefined);

    expect(await store.delete()).toBe(true);

    expect(service.delete).toHaveBeenCalledWith('c1');
    expect(service.get).not.toHaveBeenCalled();
  });

  it('should update a video and read the collection again', async () => {
    const store = await loaded(collection([video('a')]));
    service.updateVideo.mockResolvedValue(undefined);

    expect(await store.updateVideo('a', { title: 'Planka', text: '3 × 10' })).toBe(true);

    expect(service.updateVideo).toHaveBeenCalledWith('c1', 'a', {
      title: 'Planka',
      text: '3 × 10',
    });
    expect(service.get).toHaveBeenCalledTimes(2);
  });
});
