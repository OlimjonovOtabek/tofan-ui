import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { OutgoingDraft } from './models/chat-outbox';
import { MediaDeniedError } from './services/media-capture';
import { VoiceRecorder, VoiceRecording } from './services/voice-recorder.service';
import { VoiceRecordingStore } from './voice-recording.store';

describe('VoiceRecordingStore', () => {
  const handle: VoiceRecording = {
    fileName: 'voice.webm',
    level: vi.fn(() => 40),
    stop: vi.fn(() => Promise.resolve(new Blob(['voice'], { type: 'audio/webm' }))),
    cancel: vi.fn(),
  };
  const recorder = { start: vi.fn() };
  const conversation = { notifyActivity: vi.fn() };
  const outbox = { send: vi.fn<(draft: OutgoingDraft) => void>() };
  const notifications = { failure: vi.fn(), info: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    recorder.start.mockResolvedValue(handle);
    TestBed.configureTestingModule({
      providers: [
        VoiceRecordingStore,
        { provide: VoiceRecorder, useValue: recorder },
        { provide: ConversationStore, useValue: conversation },
        { provide: ChatOutboxStore, useValue: outbox },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('should track time and levels and tell the other side while recording', async () => {
    const store = TestBed.inject(VoiceRecordingStore);

    await store.start();
    vi.advanceTimersByTime(300);

    expect(store.recording()?.elapsedMs).toBe(300);
    expect(store.recording()?.levels).toEqual([40, 40, 40]);
    expect(conversation.notifyActivity).toHaveBeenCalledWith('recordingVoice');
  });

  it('should send the recording as a named voice file when it is long enough', async () => {
    const store = TestBed.inject(VoiceRecordingStore);
    await store.start();
    vi.advanceTimersByTime(2400);

    await store.finish();

    expect(store.recording()).toBeNull();
    expect(outbox.send).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'voice', caption: '', durationSeconds: 2 }),
    );
    expect(outbox.send.mock.calls[0][0].files[0].file.name).toBe('voice.webm');
  });

  it('should drop a recording shorter than one second', async () => {
    const store = TestBed.inject(VoiceRecordingStore);
    await store.start();
    vi.advanceTimersByTime(500);

    await store.finish();

    expect(outbox.send).not.toHaveBeenCalled();
    expect(notifications.info).toHaveBeenCalledWith('coachApp.conversation.voiceTooShort');
  });

  it('should discard the recording when it is cancelled', async () => {
    const store = TestBed.inject(VoiceRecordingStore);
    await store.start();

    store.cancel();

    expect(handle.cancel).toHaveBeenCalled();
    expect(store.recording()).toBeNull();
  });

  it('should explain a blocked microphone when the browser refuses access', async () => {
    const store = TestBed.inject(VoiceRecordingStore);
    recorder.start.mockRejectedValueOnce(new MediaDeniedError());

    await store.start();

    expect(notifications.failure).toHaveBeenCalledWith('coachApp.conversation.microphoneDenied');
    expect(store.recording()).toBeNull();
  });

  it('should stop and send on its own at fifteen minutes', async () => {
    const store = TestBed.inject(VoiceRecordingStore);
    await store.start();

    vi.advanceTimersByTime(15 * 60 * 1000);
    await vi.waitFor(() => expect(outbox.send).toHaveBeenCalledTimes(1));

    expect(outbox.send.mock.calls[0][0].durationSeconds).toBe(900);
  });
});
