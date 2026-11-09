import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { ChatOutboxStore } from './chat-outbox.store';
import { ConversationStore } from './conversation.store';
import { MAX_VOICE_MS, isLongEnough, pushLevel, recordedSeconds } from './models/voice-note';
import {
  MicrophoneDeniedError,
  VoiceRecorder,
  VoiceRecording,
} from './services/voice-recorder.service';

const TICK_MS = 100;

export interface RecordingState {
  readonly elapsedMs: number;
  readonly levels: readonly number[];
}

@Injectable()
export class VoiceRecordingStore {
  private readonly recorder = inject(VoiceRecorder);
  private readonly conversation = inject(ConversationStore);
  private readonly outbox = inject(ChatOutboxStore);
  private readonly notifications = inject(NotificationService);
  private handle: VoiceRecording | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private starting = false;

  readonly recording = signal<RecordingState | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  async start(): Promise<void> {
    if (this.handle !== null || this.starting) {
      return;
    }
    this.starting = true;
    try {
      this.handle = await this.recorder.start();
      this.startedAt = Date.now();
      this.recording.set({ elapsedMs: 0, levels: [] });
      this.timer = setInterval(() => this.tick(), TICK_MS);
      this.conversation.notifyActivity('recordingVoice');
    } catch (error) {
      this.notifications.failure(
        error instanceof MicrophoneDeniedError
          ? 'coachApp.conversation.microphoneDenied'
          : 'coachApp.conversation.microphoneUnavailable',
      );
    } finally {
      this.starting = false;
    }
  }

  async finish(): Promise<void> {
    const handle = this.handle;
    if (handle === null) {
      return;
    }
    const elapsedMs = Date.now() - this.startedAt;
    this.reset();
    const blob = await handle.stop();
    if (!isLongEnough(elapsedMs)) {
      this.notifications.info('coachApp.conversation.voiceTooShort');
      return;
    }
    const file = new File([blob], handle.format.fileName, { type: blob.type });
    this.outbox.send({
      kind: 'voice',
      files: [{ id: `voice-${this.startedAt}`, file, previewUrl: null }],
      caption: '',
      durationSeconds: recordedSeconds(elapsedMs),
    });
  }

  cancel(): void {
    this.handle?.cancel();
    this.reset();
  }

  private tick(): void {
    const handle = this.handle;
    if (handle === null) {
      return;
    }
    const elapsedMs = Date.now() - this.startedAt;
    this.recording.update((state) => ({
      elapsedMs,
      levels: pushLevel(state?.levels ?? [], handle.level()),
    }));
    this.conversation.notifyActivity('recordingVoice');
    if (elapsedMs >= MAX_VOICE_MS) {
      void this.finish();
    }
  }

  private reset(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.handle = null;
    this.recording.set(null);
  }
}
