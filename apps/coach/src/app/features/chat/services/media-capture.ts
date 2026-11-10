import { RecordingFormat, pickRecordingFormat } from '../models/recording';

const CHUNK_MS = 250;
const DENIED_ERRORS = ['NotAllowedError', 'SecurityError'];

export class MediaDeniedError extends Error {
  constructor() {
    super('Camera or microphone access was denied');
  }
}

export class MediaUnavailableError extends Error {
  constructor() {
    super('This browser cannot record from the camera or microphone');
  }
}

export interface CapturedRecording {
  readonly fileName: string;
  stop(): Promise<Blob>;
  cancel(): void;
}

export function supportedFormat(formats: readonly RecordingFormat[]): RecordingFormat {
  const format =
    typeof MediaRecorder === 'undefined'
      ? null
      : pickRecordingFormat(formats, (mimeType) => MediaRecorder.isTypeSupported(mimeType));
  if (format === null || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
    throw new MediaUnavailableError();
  }
  return format;
}

export async function openMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    throw error instanceof DOMException && DENIED_ERRORS.includes(error.name)
      ? new MediaDeniedError()
      : new MediaUnavailableError();
  }
}

export function stopTracks(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

export function captureStream(
  stream: MediaStream,
  format: RecordingFormat,
  options: MediaRecorderOptions,
  release: () => void,
): CapturedRecording {
  const recorder = new MediaRecorder(stream, { ...options, mimeType: format.mimeType });
  const chunks = collectChunks(recorder);
  recorder.start(CHUNK_MS);
  return {
    fileName: format.fileName,
    stop: () => stopRecording(recorder, chunks, format.mimeType, release),
    cancel: () => {
      recorder.onstop = release;
      recorder.stop();
    },
  };
}

function collectChunks(recorder: MediaRecorder): Blob[] {
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  return chunks;
}

function stopRecording(
  recorder: MediaRecorder,
  chunks: readonly Blob[],
  fallbackType: string,
  release: () => void,
): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      release();
      resolve(new Blob([...chunks], { type: recorder.mimeType || fallbackType }));
    };
    recorder.stop();
  });
}
