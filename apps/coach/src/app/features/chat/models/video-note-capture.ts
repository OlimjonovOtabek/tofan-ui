import { RecordingFormat } from './recording';

export const MAX_VIDEO_NOTE_MS = 60 * 1000;
export const VIDEO_NOTE_SECONDS = MAX_VIDEO_NOTE_MS / 1000;

export const VIDEO_NOTE_FORMATS: readonly RecordingFormat[] = [
  { mimeType: 'video/webm;codecs=vp9,opus', fileName: 'video-note.webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', fileName: 'video-note.webm' },
  { mimeType: 'video/mp4', fileName: 'video-note.mp4' },
  { mimeType: 'video/webm', fileName: 'video-note.webm' },
];
