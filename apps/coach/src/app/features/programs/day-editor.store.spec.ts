import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { DayEditorStore } from './day-editor.store';

describe('DayEditorStore', () => {
  const upload = vi.fn();
  const read = vi.fn();
  const notifications = { failure: vi.fn(), error: vi.fn() };
  let store: DayEditorStore;
  const file = new File(['x'], 'squat.mp4', { type: 'video/mp4' });

  beforeEach(() => {
    vi.resetAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:1');
    URL.revokeObjectURL = vi.fn();
    read.mockResolvedValue([]);
    TestBed.configureTestingModule({
      providers: [
        DayEditorStore,
        { provide: FileUploadService, useValue: { upload } },
        { provide: VideoStatusService, useValue: { read } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(DayEditorStore);
  });

  it('should add a pending video and keep the day unsaved until the upload ends', async () => {
    let finish: (id: string) => void = () => undefined;
    upload.mockReturnValue(new Promise<string>((resolve) => (finish = resolve)));
    store.title.set('Legs');

    store.addFile(file);

    expect(store.uploading()).toBe(true);
    expect(store.canSave()).toBe(false);
    finish('f1');
    await vi.waitFor(() => expect(store.canSave()).toBe(true));
    expect(store.videos()[0].fileId).toBe('f1');
  });

  it('should mark the video failed and offer a retry when the upload fails', async () => {
    upload.mockRejectedValueOnce(new Error('offline'));

    store.addFile(file);
    await vi.waitFor(() => expect(store.videos()[0].uploadFailed).toBe(true));
    upload.mockResolvedValue('f2');
    store.retry(store.videos()[0].key);

    await vi.waitFor(() => expect(store.videos()[0].fileId).toBe('f2'));
    expect(notifications.error).toHaveBeenCalledTimes(1);
  });

  it('should drop the video and warn when it is too large', async () => {
    upload.mockRejectedValue(new BusinessRuleError('big', 'StoredFile.TooLarge'));

    store.addFile(file);

    await vi.waitFor(() => expect(store.videos()).toEqual([]));
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.day.videoTooLarge');
  });

  it('should reorder and rename videos', () => {
    store.init({
      title: 'x',
      description: '',
      droppedExerciseCount: 0,
      videos: ['a', 'b'].map((key) => ({
        key,
        name: key,
        fileId: key,
        videoUrl: null,
        hlsUrl: null,
        posterUrl: null,
        localUrl: null,
        progress: null,
        uploadFailed: false,
      })),
    });

    store.reorder(0, 1);
    store.rename('a', 'Alpha');

    expect(store.videos().map((video) => video.name)).toEqual(['b', 'Alpha']);
  });
});
