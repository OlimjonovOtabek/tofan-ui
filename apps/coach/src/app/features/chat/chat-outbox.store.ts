import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import {
  FileUploadTask,
  isUploadCancelled,
} from '@shared/components/file-upload/file-upload-request';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { ConversationStore } from './conversation.store';
import { Message } from './models/chat';
import {
  OUTGOING_CATEGORIES,
  OutgoingDraft,
  PendingMessage,
  captionFor,
  combinedProgress,
} from './models/chat-outbox';
import { ChatService } from './services/chat.service';
import { PreviewUrls } from './services/preview-urls.service';

@Injectable()
export class ChatOutboxStore {
  private readonly conversation = inject(ConversationStore);
  private readonly service = inject(ChatService);
  private readonly uploads = inject(FileUploadService);
  private readonly previews = inject(PreviewUrls);
  private readonly notifications = inject(NotificationService);
  private readonly tasks = new Map<string, readonly FileUploadTask[]>();
  private nextId = 0;

  readonly pending = signal<readonly PendingMessage[]>([]);
  readonly sendingText = signal(false);
  readonly outgoingRevision = signal(0);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.pending().forEach((item) => this.discard(item.id)));
  }

  async sendText(text: string): Promise<boolean> {
    const id = this.conversation.conversationId();
    const body = text.trim();
    if (id === null || body === '' || this.sendingText()) {
      return false;
    }
    this.sendingText.set(true);
    this.outgoingRevision.update((count) => count + 1);
    try {
      this.showSent(await this.service.send(id, body));
      return true;
    } catch (error) {
      this.conversation.refused(error);
      this.notifications.error(error);
      return false;
    } finally {
      this.sendingText.set(false);
    }
  }

  send(draft: OutgoingDraft): void {
    const id = `pending-${this.nextId++}`;
    this.outgoingRevision.update((count) => count + 1);
    this.pending.update((items) => [...items, { ...draft, id, progress: 0, failure: null }]);
    void this.run(id);
  }

  retry(id: string): void {
    this.patch(id, { progress: 0, failure: null });
    void this.run(id);
  }

  discard(id: string): void {
    this.tasks.get(id)?.forEach((task) => task.cancel());
    this.tasks.delete(id);
    const item = this.pending().find((pending) => pending.id === id);
    item?.files.forEach((picked) => this.previews.revoke(picked.previewUrl));
    this.pending.update((items) => items.filter((pending) => pending.id !== id));
  }

  private showSent(message: Message): void {
    this.conversation.show([message]);
    this.outgoingRevision.update((revision) => revision + 1);
  }

  private async run(id: string): Promise<void> {
    const item = this.pending().find((pending) => pending.id === id);
    const conversationId = this.conversation.conversationId();
    if (item === undefined || conversationId === null) {
      return;
    }
    try {
      const fileIds = await this.upload(item);
      const message = await this.service.send(
        conversationId,
        captionFor(item.kind, item.caption),
        fileIds,
      );
      this.showSent(message);
      this.discard(id);
    } catch (error) {
      this.failed(id, error);
    }
  }

  private async upload(item: PendingMessage): Promise<string[]> {
    const sizes = item.files.map((picked) => picked.file.size);
    const percents = sizes.map(() => 0);
    const tasks = item.files.map((picked, index) =>
      this.uploads.startUpload({
        file: picked.file,
        category: OUTGOING_CATEGORIES[item.kind],
        onProgress: (percent) => {
          percents[index] = percent;
          this.patch(item.id, { progress: combinedProgress(sizes, percents) });
          this.conversation.notifyActivity('uploading');
        },
      }),
    );
    this.tasks.set(item.id, tasks);
    this.conversation.notifyActivity('uploading');
    try {
      return await Promise.all(tasks.map((task) => task.result));
    } catch (error) {
      tasks.forEach((task) => task.cancel());
      throw error;
    } finally {
      this.tasks.delete(item.id);
    }
  }

  private failed(id: string, error: unknown): void {
    if (isUploadCancelled(error) || !this.pending().some((pending) => pending.id === id)) {
      return;
    }
    this.conversation.refused(error);
    this.patch(id, { failure: toErrorMessage(error) });
    this.notifications.error(error);
  }

  private patch(id: string, change: Partial<Pick<PendingMessage, 'progress' | 'failure'>>): void {
    this.pending.update((items) =>
      items.map((pending) => (pending.id === id ? { ...pending, ...change } : pending)),
    );
  }
}
