import { Injectable } from '@angular/core';
import { VOICE_FORMATS, levelFromRms } from '../models/voice-note';
import {
  CapturedRecording,
  captureStream,
  openMedia,
  stopTracks,
  supportedFormat,
} from './media-capture';

const AUDIO_BITS_PER_SECOND = 64_000;
const ANALYSER_SIZE = 512;
const SAMPLE_CENTER = 128;

export interface VoiceRecording extends CapturedRecording {
  level(): number;
}

interface LevelMeter {
  level(): number;
  close(): void;
}

@Injectable({ providedIn: 'root' })
export class VoiceRecorder {
  async start(): Promise<VoiceRecording> {
    const format = supportedFormat(VOICE_FORMATS);
    const stream = await openMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    const meter = createMeter(stream);
    const recording = captureStream(
      stream,
      format,
      { audioBitsPerSecond: AUDIO_BITS_PER_SECOND },
      () => {
        stopTracks(stream);
        meter.close();
      },
    );
    return { ...recording, level: () => meter.level() };
  }
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
