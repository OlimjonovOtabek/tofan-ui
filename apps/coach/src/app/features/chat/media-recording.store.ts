import { DestroyRef, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { ChatActivity } from './models/chat-activity';
import { OutgoingKind } from './models/chat-outbox';
import { RecordingState, isLongEnough, recordedSeconds } from './models/recording';
import { CapturedRecording, MediaDeniedError } from './services/media-capture';
import { PreviewUrls } from './services/preview-urls.service';

const TICK_MS = 100;

export interface RecordingPlan<THandle extends CapturedRecording> {
  readonly kind: Extract<OutgoingKind, 'voice' | 'videoNote'>;
  readonly activity: ChatActivity;
  readonly maxMs: number;
  readonly denied: TranslationKey;
  readonly unavailable: TranslationKey;
  readonly tooShort: TranslationKey;
  readonly preview: boolean;
  open(): Promise<THandle>;
  level(handle: THandle, state: RecordingState | null): readonly number[];
}

export abstract class MediaRecordingStore<THandle extends CapturedRecording> {
  private readonly conversation = inject(ConversationStore);
  private readonly outbox = inject(ChatOutboxStore);
  private readonly previews = inject(PreviewUrls);
  private readonly notifications = inject(NotificationService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private starting = false;

  protected abstract readonly plan: RecordingPlan<THandle>;

  readonly recording = signal<RecordingState | null>(null);
  readonly capture = signal<THandle | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  async start(): Promise<void> {
    if (this.capture() !== null || this.starting) {
      return;
    }
    this.starting = true;
    try {
      this.capture.set(await this.plan.open());
      this.startedAt = Date.now();
      this.recording.set({ elapsedMs: 0, levels: [] });
      this.timer = setInterval(() => this.tick(), TICK_MS);
      this.conversation.notifyActivity(this.plan.activity);
    } catch (error) {
      this.notifications.failure(
        error instanceof MediaDeniedError ? this.plan.denied : this.plan.unavailable,
      );
    } finally {
      this.starting = false;
    }
  }

  async finish(): Promise<void> {
    const handle = this.capture();
    if (handle === null) {
      return;
    }
    const elapsedMs = Date.now() - this.startedAt;
    this.reset();
    const blob = await handle.stop();
    if (!isLongEnough(elapsedMs)) {
      this.notifications.info(this.plan.tooShort);
      return;
    }
    this.send(new File([blob], handle.fileName, { type: blob.type }), elapsedMs);
  }

  cancel(): void {
    this.capture()?.cancel();
    this.reset();
  }

  private send(file: File, elapsedMs: number): void {
    this.outbox.send({
      kind: this.plan.kind,
      files: [
        {
          id: `${this.plan.kind}-${this.startedAt}`,
          file,
          previewUrl: this.plan.preview ? this.previews.create(file) : null,
        },
      ],
      caption: '',
      durationSeconds: recordedSeconds(elapsedMs),
    });
  }

  private tick(): void {
    const handle = this.capture();
    if (handle === null) {
      return;
    }
    const elapsedMs = Date.now() - this.startedAt;
    this.recording.update((state) => ({ elapsedMs, levels: this.plan.level(handle, state) }));
    this.conversation.notifyActivity(this.plan.activity);
    if (elapsedMs >= this.plan.maxMs) {
      void this.finish();
    }
  }

  private reset(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.capture.set(null);
    this.recording.set(null);
  }
}
