import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadRequest } from '@shared/components/file-upload/file-upload-request';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { Message } from './models/chat';
import { OutgoingDraft } from './models/chat-outbox';
import { ChatService } from './services/chat.service';
import { PreviewUrls } from './services/preview-urls.service';

const sent = (id: string): Message => ({
  id,
  conversationId: 'c1',
  senderUserId: 'me',
  kind: 'image',
  text: '',
  attachments: [],
  sentOn: new Date(2026, 10, 9, 10, 0),
});
const picked = (name: string, size = 100) => ({
  id: name,
  file: new File(['x'.repeat(size)], name, { type: 'image/jpeg' }),
  previewUrl: `blob:${name}`,
});
const draft = (change: Partial<OutgoingDraft> = {}): OutgoingDraft => ({
  kind: 'image',
  files: [picked('a.jpg'), picked('b.jpg')],
  caption: '  Leg day ',
  durationSeconds: null,
  ...change,
});

describe('ChatOutboxStore', () => {
  const service = { send: vi.fn() };
  const uploads = { startUpload: vi.fn() };
  const previews = { create: vi.fn(), revoke: vi.fn() };
  const notifications = { error: vi.fn() };
  const conversation = {
    conversationId: vi.fn(() => 'c1' as string | null),
    show: vi.fn(),
    refused: vi.fn(),
    notifyActivity: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    conversation.conversationId.mockReturnValue('c1');
    TestBed.configureTestingModule({
      providers: [
        ChatOutboxStore,
        { provide: ConversationStore, useValue: conversation },
        { provide: ChatService, useValue: service },
        { provide: FileUploadService, useValue: uploads },
        { provide: PreviewUrls, useValue: previews },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  function uploadsResolving(...fileIds: string[]): void {
    for (const fileId of fileIds) {
      uploads.startUpload.mockImplementationOnce((request: FileUploadRequest) => {
        request.onProgress?.(100);
        return { result: Promise.resolve(fileId), cancel: vi.fn() };
      });
    }
  }

  it('should send a trimmed text once when the text is not empty', async () => {
    const store = TestBed.inject(ChatOutboxStore);
    service.send.mockResolvedValueOnce(sent('m1'));

    expect(await store.sendText('  hello ')).toBe(true);
    expect(await store.sendText('   ')).toBe(false);
    expect(store.outgoingRevision()).toBe(2);

    expect(service.send).toHaveBeenCalledTimes(1);
    expect(service.send).toHaveBeenCalledWith('c1', 'hello');
    expect(conversation.show).toHaveBeenCalledWith([sent('m1')]);
  });

  it('should report a failed text send and let the store lock writing when it is refused', async () => {
    const store = TestBed.inject(ChatOutboxStore);
    const refusal = new AccessDeniedError('VIP required', 'Chat.SubscriptionRequired');
    service.send.mockRejectedValueOnce(refusal);

    expect(await store.sendText('hello')).toBe(false);

    expect(conversation.refused).toHaveBeenCalledWith(refusal);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
  });

  it('should upload every file in the chat category and send their ids with the caption', async () => {
    const store = TestBed.inject(ChatOutboxStore);
    uploadsResolving('f1', 'f2');
    service.send.mockResolvedValueOnce(sent('m1'));

    store.send(draft());

    expect(store.outgoingRevision()).toBe(1);
    await vi.waitFor(() => expect(store.pending()).toEqual([]));
    expect(store.outgoingRevision()).toBe(2);
    expect(uploads.startUpload).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'chatImage' }),
    );
    expect(service.send).toHaveBeenCalledWith('c1', 'Leg day', ['f1', 'f2']);
    expect(conversation.show).toHaveBeenCalledWith([sent('m1')]);
    expect(conversation.notifyActivity).toHaveBeenCalledWith('uploading');
    expect(previews.revoke).toHaveBeenCalledWith('blob:a.jpg');
  });

  it('should send a voice message without text in the voice category', async () => {
    const store = TestBed.inject(ChatOutboxStore);
    uploadsResolving('v1');
    service.send.mockResolvedValueOnce(sent('m1'));

    store.send(
      draft({ kind: 'voice', files: [picked('voice.webm')], caption: 'x', durationSeconds: 4 }),
    );

    await vi.waitFor(() => expect(service.send).toHaveBeenCalledWith('c1', '', ['v1']));
    expect(uploads.startUpload).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'chatVoice' }),
    );
  });

  it('should keep a failed message with its error and send it again on retry', async () => {
    const store = TestBed.inject(ChatOutboxStore);
    uploads.startUpload.mockReturnValueOnce({
      result: Promise.reject(new AccessDeniedError()),
      cancel: vi.fn(),
    });

    store.send(draft({ files: [picked('a.jpg')] }));

    await vi.waitFor(() => expect(store.pending()[0]?.failure).not.toBeNull());
    expect(notifications.error).toHaveBeenCalledTimes(1);
    uploadsResolving('f1');
    service.send.mockResolvedValueOnce(sent('m1'));

    store.retry(store.pending()[0].id);

    await vi.waitFor(() => expect(store.pending()).toEqual([]));
  });

  it('should cancel the uploads and forget the message when it is discarded', () => {
    const store = TestBed.inject(ChatOutboxStore);
    const cancel = vi.fn();
    uploads.startUpload.mockReturnValue({ result: new Promise(() => undefined), cancel });

    store.send(draft());
    store.discard(store.pending()[0].id);

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(store.pending()).toEqual([]);
    expect(previews.revoke).toHaveBeenCalledWith('blob:b.jpg');
  });

  it('should report the combined upload progress of all files', () => {
    const store = TestBed.inject(ChatOutboxStore);
    const requests: FileUploadRequest[] = [];
    uploads.startUpload.mockImplementation((request: FileUploadRequest) => {
      requests.push(request);
      return { result: new Promise(() => undefined), cancel: vi.fn() };
    });

    store.send(draft({ files: [picked('a.jpg', 300), picked('b.jpg', 100)] }));
    requests[0].onProgress?.(50);

    expect(store.pending()[0].progress).toBe(38);
  });
});
