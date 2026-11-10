import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { OutgoingDraft } from './models/chat-outbox';
import { MediaUnavailableError } from './services/media-capture';
import { PreviewUrls } from './services/preview-urls.service';
import { VideoNoteRecorder, VideoNoteRecording } from './services/video-note-recorder.service';
import { VideoNoteRecordingStore } from './video-note-recording.store';

describe('VideoNoteRecordingStore', () => {
  const stream = {} as MediaStream;
  const handle: VideoNoteRecording = {
    fileName: 'video-note.webm',
    stream,
    stop: vi.fn(() => Promise.resolve(new Blob(['video'], { type: 'video/webm' }))),
    cancel: vi.fn(),
  };
  const recorder = { start: vi.fn() };
  const conversation = { notifyActivity: vi.fn() };
  const outbox = { send: vi.fn<(draft: OutgoingDraft) => void>() };
  const previews = { create: vi.fn(() => 'blob:note'), revoke: vi.fn() };
  const notifications = { failure: vi.fn(), info: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    recorder.start.mockResolvedValue(handle);
    TestBed.configureTestingModule({
      providers: [
        VideoNoteRecordingStore,
        { provide: VideoNoteRecorder, useValue: recorder },
        { provide: ConversationStore, useValue: conversation },
        { provide: ChatOutboxStore, useValue: outbox },
        { provide: PreviewUrls, useValue: previews },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('should expose the camera stream and tell the other side a video is recording', async () => {
    const store = TestBed.inject(VideoNoteRecordingStore);

    await store.start();
    vi.advanceTimersByTime(200);

    expect(store.stream()).toBe(stream);
    expect(store.recording()?.elapsedMs).toBe(200);
    expect(conversation.notifyActivity).toHaveBeenCalledWith('recordingVideo');
  });

  it('should send a round video with a local preview and no caption', async () => {
    const store = TestBed.inject(VideoNoteRecordingStore);
    await store.start();
    vi.advanceTimersByTime(4200);

    await store.finish();

    const draft = outbox.send.mock.calls[0][0];
    expect(draft).toEqual(
      expect.objectContaining({ kind: 'videoNote', caption: '', durationSeconds: 4 }),
    );
    expect(draft.files[0].file.name).toBe('video-note.webm');
    expect(draft.files[0].previewUrl).toBe('blob:note');
    expect(store.stream()).toBeNull();
  });

  it('should stop and send on its own at sixty seconds', async () => {
    const store = TestBed.inject(VideoNoteRecordingStore);
    await store.start();

    vi.advanceTimersByTime(60_000);
    await vi.waitFor(() => expect(outbox.send).toHaveBeenCalledTimes(1));

    expect(outbox.send.mock.calls[0][0].durationSeconds).toBe(60);
  });

  it('should say the browser cannot record video when no camera is available', async () => {
    const store = TestBed.inject(VideoNoteRecordingStore);
    recorder.start.mockRejectedValueOnce(new MediaUnavailableError());

    await store.start();

    expect(notifications.failure).toHaveBeenCalledWith('coachApp.conversation.cameraUnavailable');
    expect(store.recording()).toBeNull();
  });
});
