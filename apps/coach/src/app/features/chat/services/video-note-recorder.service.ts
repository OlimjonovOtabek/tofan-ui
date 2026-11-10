import { Injectable } from '@angular/core';
import { VIDEO_NOTE_FORMATS } from '../models/video-note-capture';
import {
  CapturedRecording,
  captureStream,
  openMedia,
  stopTracks,
  supportedFormat,
} from './media-capture';

const VIDEO_BITS_PER_SECOND = 1_000_000;
const AUDIO_BITS_PER_SECOND = 64_000;
const IDEAL_SIDE_PX = 480;

export interface VideoNoteRecording extends CapturedRecording {
  readonly stream: MediaStream;
}

@Injectable({ providedIn: 'root' })
export class VideoNoteRecorder {
  async start(): Promise<VideoNoteRecording> {
    const format = supportedFormat(VIDEO_NOTE_FORMATS);
    const stream = await openMedia({
      video: {
        facingMode: 'user',
        width: { ideal: IDEAL_SIDE_PX },
        height: { ideal: IDEAL_SIDE_PX },
      },
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    const recording = captureStream(
      stream,
      format,
      { videoBitsPerSecond: VIDEO_BITS_PER_SECOND, audioBitsPerSecond: AUDIO_BITS_PER_SECOND },
      () => stopTracks(stream),
    );
    return { ...recording, stream };
  }
}
