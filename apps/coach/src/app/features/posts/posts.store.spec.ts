import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { VideoUploadSaveResult } from '@coach/core/videos/video-upload';
import { Subject } from 'rxjs';
import { Post, PostsPage } from './models/post';
import { PostsStore } from './posts.store';
import { PostsService } from './services/posts.service';

function post(id: string, fileId: string | null = null): Post {
  return {
    id,
    authorName: 'Aziz',
    authorInitials: 'A',
    authorPhotoUrl: null,
    title: id,
    text: '',
    fileId,
    createdOn: new Date(),
    updatedOn: new Date(),
    video: null,
  };
}

function page(posts: Post[], totalCount = posts.length): PostsPage {
  return { posts, totalCount };
}

describe('PostsStore', () => {
  const service = { list: vi.fn(), delete: vi.fn() };
  const statuses = { track: vi.fn() };
  const notifications = { error: vi.fn() };
  const saves = new Subject<VideoUploadSaveResult>();

  beforeEach(() => {
    vi.resetAllMocks();
    statuses.track.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        PostsStore,
        { provide: PostsService, useValue: service },
        { provide: VideoStatusesStore, useValue: statuses },
        { provide: NotificationService, useValue: notifications },
        {
          provide: VideoUploadsStore,
          useValue: {
            saves$: saves,
            uploads: signal({}),
            progressIn: () => null,
            preparingIn: () => false,
          },
        },
      ],
    });
  });

  it('should show the first page and watch its videos when loaded', async () => {
    service.list.mockResolvedValue(page([post('a', 'fa'), post('b')], 3));
    const store = TestBed.inject(PostsStore);

    await store.load();

    expect(service.list).toHaveBeenCalledWith(0);
    expect(store.page()?.posts.map((p) => p.id)).toEqual(['a', 'b']);
    expect(store.hasMore()).toBe(true);
    expect(statuses.track).toHaveBeenCalledWith(['fa']);
  });

  it('should keep the load error when the first page fails', async () => {
    service.list.mockRejectedValue(new Error('down'));
    const store = TestBed.inject(PostsStore);

    await store.load();

    expect(store.page()).toBeNull();
    expect(store.loadError()).toBe('errors.classes.generic');
  });

  it('should append older posts when more are asked for', async () => {
    service.list.mockResolvedValueOnce(page([post('a'), post('b')], 3));
    service.list.mockResolvedValueOnce(page([post('b'), post('c')], 3));
    const store = TestBed.inject(PostsStore);
    await store.load();

    await store.loadMore();

    expect(service.list).toHaveBeenLastCalledWith(2);
    expect(store.page()?.posts.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(store.hasMore()).toBe(false);
  });

  it('should drop a post when it is deleted', async () => {
    service.list.mockResolvedValue(page([post('a'), post('b')]));
    service.delete.mockResolvedValue(undefined);
    const store = TestBed.inject(PostsStore);
    await store.load();

    await store.delete('a');

    expect(service.delete).toHaveBeenCalledWith('a');
    expect(store.page()?.posts.map((p) => p.id)).toEqual(['b']);
    expect(store.page()?.totalCount).toBe(1);
  });

  it('should keep the post and say why when deleting fails', async () => {
    service.list.mockResolvedValue(page([post('a')]));
    const failure = new Error('nope');
    service.delete.mockRejectedValue(failure);
    const store = TestBed.inject(PostsStore);
    await store.load();

    await store.delete('a');

    expect(store.page()?.posts).toHaveLength(1);
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should read the list again when a queued post was saved', async () => {
    service.list.mockResolvedValue(page([]));
    const store = TestBed.inject(PostsStore);
    await store.load();
    service.list.mockClear();

    saves.next({ group: 'other', tag: null, failure: null, succeeded: true });
    saves.next({ group: 'trainer-posts', tag: null, failure: new Error(), succeeded: false });
    expect(service.list).not.toHaveBeenCalled();
    saves.next({ group: 'trainer-posts', tag: null, failure: null, succeeded: true });

    await vi.waitFor(() => expect(service.list).toHaveBeenCalledWith(0));
  });
});
