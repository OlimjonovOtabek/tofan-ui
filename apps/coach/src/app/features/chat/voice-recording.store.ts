import { Injectable, inject } from '@angular/core';
import { MediaRecordingStore, RecordingPlan } from './media-recording.store';
import { MAX_VOICE_MS, pushLevel } from './models/voice-note';
import { VoiceRecorder, VoiceRecording } from './services/voice-recorder.service';

@Injectable()
export class VoiceRecordingStore extends MediaRecordingStore<VoiceRecording> {
  private readonly recorder = inject(VoiceRecorder);

  protected readonly plan: RecordingPlan<VoiceRecording> = {
    kind: 'voice',
    activity: 'recordingVoice',
    maxMs: MAX_VOICE_MS,
    denied: 'coachApp.conversation.microphoneDenied',
    unavailable: 'coachApp.conversation.microphoneUnavailable',
    tooShort: 'coachApp.conversation.voiceTooShort',
    preview: false,
    open: () => this.recorder.start(),
    level: (handle, state) => pushLevel(state?.levels ?? [], handle.level()),
  };
}
