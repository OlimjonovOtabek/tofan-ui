import { Injectable, computed, inject } from '@angular/core';
import { MediaRecordingStore, RecordingPlan } from './media-recording.store';
import { MAX_VIDEO_NOTE_MS } from './models/video-note-capture';
import { VideoNoteRecorder, VideoNoteRecording } from './services/video-note-recorder.service';

@Injectable()
export class VideoNoteRecordingStore extends MediaRecordingStore<VideoNoteRecording> {
  private readonly recorder = inject(VideoNoteRecorder);

  protected readonly plan: RecordingPlan<VideoNoteRecording> = {
    kind: 'videoNote',
    activity: 'recordingVideo',
    maxMs: MAX_VIDEO_NOTE_MS,
    denied: 'coachApp.conversation.cameraDenied',
    unavailable: 'coachApp.conversation.cameraUnavailable',
    tooShort: 'coachApp.conversation.videoNoteTooShort',
    preview: true,
    open: () => this.recorder.start(),
    level: () => [],
  };

  readonly stream = computed(() => this.capture()?.stream ?? null);
  readonly maxMs = MAX_VIDEO_NOTE_MS;
}
