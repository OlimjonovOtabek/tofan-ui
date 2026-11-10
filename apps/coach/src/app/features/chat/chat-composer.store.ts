import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { ensureUploadIsAllowed } from '@shared/utils/file-upload-rules';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { unsentText } from './models/chat-access';
import { MAX_ATTACHMENTS } from './models/chat-attachment';
import { OUTGOING_CATEGORIES, PickedFile } from './models/chat-outbox';
import { VoiceRecordingStore } from './voice-recording.store';
import { PreviewUrls } from './services/preview-urls.service';

export type PickKind = 'image' | 'file';

@Injectable()
export class ChatComposerStore {
  private readonly conversation = inject(ConversationStore);
  private readonly outbox = inject(ChatOutboxStore);
  private readonly previews = inject(PreviewUrls);
  private readonly notifications = inject(NotificationService);
  private readonly voice = inject(VoiceRecordingStore);
  private nextId = 0;

  readonly draft = signal('');
  readonly picked = signal<readonly PickedFile[]>([]);
  readonly pickedKind = signal<PickKind | null>(null);
  readonly recording = this.voice.recording;
  readonly maxAttachments = MAX_ATTACHMENTS;

  readonly hasPicked = computed(() => this.picked().length > 0);
  readonly canSend = computed(
    () =>
      this.recording() === null &&
      !this.outbox.sendingText() &&
      (this.hasPicked() || this.draft().trim() !== ''),
  );
  readonly showsMicrophone = computed(() => !this.hasPicked() && this.draft().trim() === '');
  readonly unsent = computed(() => unsentText(this.draft(), this.conversation.canWrite()));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearPicked());
  }

  setDraft(text: string): void {
    this.draft.set(text);
    if (text.trim() !== '') {
      this.conversation.typed();
    }
  }

  pick(kind: PickKind, files: readonly File[]): void {
    const current = this.pickedKind();
    if (files.length === 0) {
      return;
    }
    if (current !== null && current !== kind) {
      this.notifications.failure('coachApp.conversation.mixedAttachments');
      return;
    }
    const accepted = this.accepted(kind, files.slice(0, MAX_ATTACHMENTS - this.picked().length));
    if (files.length > MAX_ATTACHMENTS - this.picked().length) {
      this.notifications.failure('coachApp.conversation.tooManyAttachments', {
        max: MAX_ATTACHMENTS,
      });
    }
    if (accepted.length > 0) {
      this.picked.update((picked) => [...picked, ...accepted]);
      this.pickedKind.set(kind);
    }
  }

  remove(id: string): void {
    const removed = this.picked().find((picked) => picked.id === id);
    this.previews.revoke(removed?.previewUrl ?? null);
    this.picked.update((picked) => picked.filter((item) => item.id !== id));
    if (this.picked().length === 0) {
      this.pickedKind.set(null);
    }
  }

  async send(): Promise<void> {
    if (!this.canSend()) {
      return;
    }
    const kind = this.pickedKind();
    if (kind !== null) {
      this.outbox.send({
        kind,
        files: this.picked(),
        caption: this.draft(),
        durationSeconds: null,
      });
      this.picked.set([]);
      this.pickedKind.set(null);
      this.draft.set('');
      return;
    }
    const text = this.draft();
    this.draft.set('');
    if (!(await this.outbox.sendText(text)) && this.draft() === '') {
      this.draft.set(text);
    }
  }

  startRecording(): Promise<void> {
    return this.voice.start();
  }

  finishRecording(): Promise<void> {
    return this.voice.finish();
  }

  cancelRecording(): void {
    this.voice.cancel();
  }

  private accepted(kind: PickKind, files: readonly File[]): PickedFile[] {
    const accepted: PickedFile[] = [];
    for (const file of files) {
      try {
        ensureUploadIsAllowed(file.name, file.size, OUTGOING_CATEGORIES[kind]);
        const previewUrl = kind === 'image' ? this.previews.create(file) : null;
        accepted.push({ id: `picked-${this.nextId++}`, file, previewUrl });
      } catch (error) {
        this.notifications.error(error);
      }
    }
    return accepted;
  }

  private clearPicked(): void {
    this.picked().forEach((picked) => this.previews.revoke(picked.previewUrl));
    this.picked.set([]);
  }
}
