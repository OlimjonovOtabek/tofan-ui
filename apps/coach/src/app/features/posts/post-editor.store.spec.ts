import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { NO_POST_VIDEO, pickedPostVideo } from './models/post-draft';
import { PostEditorStore } from './post-editor.store';
import { PostsService } from './services/posts.service';

describe('PostEditorStore', () => {
  const service = { create: vi.fn(), update: vi.fn() };
  const uploads = { start: vi.fn(), saveWhenUploaded: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn() };
  const draft = { title: 'Title', text: 'Text' };
  const stored = {
    kind: 'stored' as const,
    fileId: 'f1',
    source: { videoUrl: '/v', hlsUrl: null, posterUrl: null },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PostEditorStore,
        { provide: PostsService, useValue: service },
        { provide: VideoUploadsStore, useValue: uploads },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should publish a new post right away when it has no new video', async () => {
    service.create.mockResolvedValue('p1');
    const store = TestBed.inject(PostEditorStore);

    expect(await store.save(null, draft, NO_POST_VIDEO)).toBe('saved');

    expect(service.create).toHaveBeenCalledWith(draft, null);
    expect(notifications.success).toHaveBeenCalledWith('coachApp.posts.published');
  });

  it('should keep the stored video when an edited post keeps it', async () => {
    service.update.mockResolvedValue(undefined);
    const store = TestBed.inject(PostEditorStore);

    expect(await store.save('p1', draft, stored)).toBe('saved');

    expect(service.update).toHaveBeenCalledWith('p1', draft, 'f1');
    expect(notifications.success).toHaveBeenCalledWith('coachApp.posts.saved');
  });

  it('should save the post once its new video is uploaded', async () => {
    uploads.start.mockReturnValue('u1');
    service.update.mockResolvedValue(undefined);
    const store = TestBed.inject(PostEditorStore);
    const file = new File(['x'], 'a.mp4');

    expect(await store.save('p1', draft, pickedPostVideo(file, null))).toBe('queued');

    expect(uploads.start).toHaveBeenCalledWith(file, {
      group: 'trainer-posts',
      link: '/profile/posts',
    });
    const queued = uploads.saveWhenUploaded.mock.calls[0][0] as {
      ids: string[];
      tag: string;
      save(fileIds: Record<string, string>): Promise<unknown>;
    };
    expect(queued.ids).toEqual(['u1']);
    expect(queued.tag).toBe('p1');
    await queued.save({ u1: 'f9' });
    expect(service.update).toHaveBeenCalledWith('p1', draft, 'f9');
    expect(notifications.success).toHaveBeenCalledWith('coachApp.posts.queued');
  });

  it('should keep the editor open with the reason when saving fails', async () => {
    service.create.mockRejectedValue(new Error('down'));
    const store = TestBed.inject(PostEditorStore);

    expect(await store.save(null, draft, NO_POST_VIDEO)).toBeNull();

    expect(store.saveError()).toBe('errors.classes.generic');
    expect(store.saving()).toBe(false);
  });
});
