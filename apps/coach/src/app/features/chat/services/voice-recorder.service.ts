import { Injectable } from '@angular/core';
import { RecordingFormat, levelFromRms, pickRecordingFormat } from '../models/voice-note';

const AUDIO_BITS_PER_SECOND = 64_000;
const CHUNK_MS = 250;
const ANALYSER_SIZE = 512;
const SAMPLE_CENTER = 128;
const DENIED_ERRORS = ['NotAllowedError', 'SecurityError'];

export class MicrophoneDeniedError extends Error {
  constructor() {
    super('Microphone access was denied');
  }
}

export class MicrophoneUnavailableError extends Error {
  constructor() {
    super('No microphone recording is available');
  }
}

export interface VoiceRecording {
  readonly format: RecordingFormat;
  level(): number;
  stop(): Promise<Blob>;
  cancel(): void;
}

interface LevelMeter {
  level(): number;
  close(): void;
}

@Injectable({ providedIn: 'root' })
export class VoiceRecorder {
  async start(): Promise<VoiceRecording> {
    const format = supportedFormat();
    const stream = await openMicrophone();
    return startRecording(stream, format);
  }
}

function supportedFormat(): RecordingFormat {
  const format =
    typeof MediaRecorder === 'undefined'
      ? null
      : pickRecordingFormat((mimeType) => MediaRecorder.isTypeSupported(mimeType));
  if (format === null || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
    throw new MicrophoneUnavailableError();
  }
  return format;
}

async function openMicrophone(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
  } catch (error) {
    throw error instanceof DOMException && DENIED_ERRORS.includes(error.name)
      ? new MicrophoneDeniedError()
      : new MicrophoneUnavailableError();
  }
}

function startRecording(stream: MediaStream, format: RecordingFormat): VoiceRecording {
  const recorder = new MediaRecorder(stream, {
    mimeType: format.mimeType,
    audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
  });
  const chunks = collectChunks(recorder);
  const meter = createMeter(stream);
  const release = (): void => {
    stream.getTracks().forEach((track) => track.stop());
    meter.close();
  };
  recorder.start(CHUNK_MS);
  return {
    format,
    level: () => meter.level(),
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

function createMeter(stream: MediaStream): LevelMeter {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_SIZE;
  context.createMediaStreamSource(stream).connect(analyser);
  void context.resume().catch(keepMeteringWhenTheContextStaysSuspended);
  const samples = new Uint8Array(analyser.fftSize);
  return {
    level: () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const value = (sample - SAMPLE_CENTER) / SAMPLE_CENTER;
        sum += value * value;
      }
      return levelFromRms(Math.sqrt(sum / samples.length));
    },
    close: () => void context.close().catch(ignoreAnAlreadyClosedContext),
  };
}

function keepMeteringWhenTheContextStaysSuspended(): void {
  return;
}

function ignoreAnAlreadyClosedContext(): void {
  return;
}
