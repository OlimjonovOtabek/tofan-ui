import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoStatusService } from '@coach/core/videos/video-status.service';
import { VideoUpload, VideoUploadStatus } from '@coach/core/videos/video-upload';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { Subject } from 'rxjs';
import { DayEditorStore } from './day-editor.store';
import { DayVideoDraft, EMPTY_DAY_DRAFT, pendingVideoDraft } from './models/day-draft';

const savedVideo = (key: string): DayVideoDraft => ({
  key,
  name: key,
  fileId: key,
  videoUrl: null,
  hlsUrl: null,
  posterUrl: null,
  localUrl: null,
  progress: null,
  preparing: false,
  uploadFailed: false,
});

describe('DayEditorStore', () => {
  const read = vi.fn();
  const notifications = { failure: vi.fn(), error: vi.fn() };
  const states = signal<Record<string, VideoUpload>>({});
  const changes = new Subject<VideoUpload>();
  const uploads = {
    uploads: states,
    changes$: changes,
    start: vi.fn(),
    retry: vi.fn(),
    cancel: vi.fn(),
  };
  const file = new File(['x'], 'squat.mp4', { type: 'video/mp4' });
  let store: DayEditorStore;

  const setStatus = (id: string, status: VideoUploadStatus): VideoUpload => {
    const upload = { id, group: 'workout-day', link: '/programs', status };
    states.update((known) => ({ ...known, [id]: upload }));
    return upload;
  };

  beforeEach(() => {
    vi.resetAllMocks();
    states.set({});
    URL.createObjectURL = vi.fn(() => 'blob:1');
    URL.revokeObjectURL = vi.fn();
    read.mockResolvedValue([]);
    uploads.start.mockReturnValue('u1');
    TestBed.configureTestingModule({
      providers: [
        DayEditorStore,
        { provide: VideoUploadsStore, useValue: uploads },
        { provide: VideoStatusService, useValue: { read } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(DayEditorStore);
  });

  it('should allow saving the day while its video is still uploading', () => {
    store.title.set('Legs');
    store.addFile(file);
    setStatus('u1', { kind: 'sending', progress: 0.5 });

    expect(store.uploading()).toBe(true);
    expect(store.canSave()).toBe(true);
    expect(store.videos()[0].progress).toBe(0.5);
  });

  it('should show the stored file once the upload is done', () => {
    store.addFile(file);
    setStatus('u1', { kind: 'done', fileId: 'f1' });

    expect(store.videos()[0].fileId).toBe('f1');
    expect(store.uploading()).toBe(false);
  });

  it('should block saving and report the error when the upload fails', () => {
    store.title.set('Legs');
    store.addFile(file);
    const failure = new Error('offline');

    changes.next(setStatus('u1', { kind: 'failed', error: failure }));

    expect(store.videos()[0].uploadFailed).toBe(true);
    expect(store.canSave()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should drop the video and warn when it is too large', () => {
    store.addFile(file);

    changes.next(setStatus('u1', { kind: 'tooLarge' }));

    expect(store.videos()).toEqual([]);
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.day.videoTooLarge');
  });

  it('should stop the uploads of this edit when it is left without saving', () => {
    store.addFile(file);

    TestBed.resetTestingModule();

    expect(uploads.cancel).toHaveBeenCalledWith('u1');
  });

  it('should keep pending uploads running when the day is finished', () => {
    store.title.set('Legs');
    store.addFile(file);
    setStatus('u1', { kind: 'sending', progress: 0.1 });

    const day = store.finish();
    TestBed.resetTestingModule();

    expect(day.videos[0].localUrl).toBeNull();
    expect(uploads.cancel).not.toHaveBeenCalled();
  });

  it('should release a finished upload and one dropped from an earlier edit', () => {
    setStatus('old', { kind: 'sending', progress: 0.1 });
    store.init({
      ...EMPTY_DAY_DRAFT,
      title: 'Legs',
      videos: [pendingVideoDraft('old', 'blob:old')],
    });
    store.remove('old');
    store.addFile(file);
    setStatus('u1', { kind: 'done', fileId: 'f1' });

    store.finish();

    expect(uploads.cancel).toHaveBeenCalledWith('old');
    expect(uploads.cancel).toHaveBeenCalledWith('u1');
  });

  it('should report changes only when the day differs from how it opened', () => {
    store.init({ ...EMPTY_DAY_DRAFT, title: 'Legs', videos: [savedVideo('a')] });

    expect(store.hasChanges()).toBe(false);
    store.rename('a', 'Alpha');
    expect(store.hasChanges()).toBe(true);
  });

  it('should reorder and rename videos', () => {
    store.init({ ...EMPTY_DAY_DRAFT, title: 'x', videos: [savedVideo('a'), savedVideo('b')] });

    store.reorder(0, 1);
    store.rename('a', 'Alpha');

    expect(store.videos().map((video) => video.name)).toEqual(['b', 'Alpha']);
  });
});
