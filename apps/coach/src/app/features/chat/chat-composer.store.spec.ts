import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ChatComposerStore } from './chat-composer.store';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { PreviewUrls } from './services/preview-urls.service';
import { VoiceRecordingStore } from './voice-recording.store';

const file = (name: string, size = 10): File => new File(['x'.repeat(size)], name);

describe('ChatComposerStore', () => {
  const conversation = { canWrite: signal(true), typed: vi.fn() };
  const outbox = { send: vi.fn(), sendText: vi.fn(), sendingText: signal(false) };
  const previews = { create: vi.fn((picked: File) => `blob:${picked.name}`), revoke: vi.fn() };
  const notifications = { error: vi.fn(), failure: vi.fn() };
  const voice = { recording: signal(null), start: vi.fn(), finish: vi.fn(), cancel: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    conversation.canWrite.set(true);
    TestBed.configureTestingModule({
      providers: [
        ChatComposerStore,
        { provide: ConversationStore, useValue: conversation },
        { provide: ChatOutboxStore, useValue: outbox },
        { provide: PreviewUrls, useValue: previews },
        { provide: NotificationService, useValue: notifications },
        { provide: VoiceRecordingStore, useValue: voice },
      ],
    });
  });

  it('should show the microphone until there is text or a picked file', () => {
    const store = TestBed.inject(ChatComposerStore);
    expect(store.showsMicrophone()).toBe(true);

    store.setDraft('hi');

    expect(store.showsMicrophone()).toBe(false);
    expect(conversation.typed).toHaveBeenCalledTimes(1);
  });

  it('should keep only accepted images with a preview when images are picked', () => {
    const store = TestBed.inject(ChatComposerStore);

    store.pick('image', [file('a.jpg'), file('b.heic'), file('c.png')]);

    expect(store.picked().map((picked) => picked.file.name)).toEqual(['a.jpg', 'c.png']);
    expect(store.picked()[0].previewUrl).toBe('blob:a.jpg');
    expect(store.pickedKind()).toBe('image');
    expect(notifications.error).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'StoredFile.UnsupportedContent' }),
    );
  });

  it('should refuse a second kind when files of another kind are picked', () => {
    const store = TestBed.inject(ChatComposerStore);
    store.pick('image', [file('a.jpg')]);

    store.pick('file', [file('plan.pdf')]);

    expect(store.picked()).toHaveLength(1);
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.conversation.mixedAttachments');
  });

  it('should stop at ten files and say so when more are picked', () => {
    const store = TestBed.inject(ChatComposerStore);

    store.pick(
      'file',
      Array.from({ length: 12 }, (_, index) => file(`doc-${index}.pdf`)),
    );

    expect(store.picked()).toHaveLength(10);
    expect(store.picked()[0].previewUrl).toBeNull();
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.conversation.tooManyAttachments', {
      max: 10,
    });
  });

  it('should hand the picked files and the caption to the outbox when sent', async () => {
    const store = TestBed.inject(ChatComposerStore);
    store.pick('image', [file('a.jpg')]);
    store.setDraft('Leg day');

    await store.send();

    expect(outbox.send).toHaveBeenCalledWith({
      kind: 'image',
      files: [expect.objectContaining({ previewUrl: 'blob:a.jpg' })],
      caption: 'Leg day',
      durationSeconds: null,
    });
    expect(store.picked()).toEqual([]);
    expect(store.draft()).toBe('');
    expect(previews.revoke).not.toHaveBeenCalled();
  });

  it('should restore the text when a text send fails', async () => {
    const store = TestBed.inject(ChatComposerStore);
    outbox.sendText.mockResolvedValueOnce(false);
    store.setDraft('hello');

    await store.send();

    expect(outbox.sendText).toHaveBeenCalledWith('hello');
    expect(store.draft()).toBe('hello');
  });

  it('should release the preview when a picked file is removed', () => {
    const store = TestBed.inject(ChatComposerStore);
    store.pick('image', [file('a.jpg')]);

    store.remove(store.picked()[0].id);

    expect(previews.revoke).toHaveBeenCalledWith('blob:a.jpg');
    expect(store.pickedKind()).toBeNull();
  });

  it('should keep the unsent text when the conversation turns read-only', () => {
    const store = TestBed.inject(ChatComposerStore);
    store.setDraft('draft');
    conversation.canWrite.set(false);

    expect(store.unsent()).toBe('draft');
  });
});
