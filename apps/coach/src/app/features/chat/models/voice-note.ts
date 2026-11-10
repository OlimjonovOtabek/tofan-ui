import { RecordingFormat } from './recording';

export const MAX_VOICE_MS = 15 * 60 * 1000;
export const LIVE_LEVEL_BARS = 48;

const LEVEL_MAX = 100;
const SILENCE_DB = -60;
const DECIBELS_PER_BEL = 20;

export const VOICE_FORMATS: readonly RecordingFormat[] = [
  { mimeType: 'audio/webm;codecs=opus', fileName: 'voice.webm' },
  { mimeType: 'audio/mp4', fileName: 'voice.m4a' },
  { mimeType: 'audio/ogg;codecs=opus', fileName: 'voice.ogg' },
  { mimeType: 'audio/webm', fileName: 'voice.webm' },
];

export function pushLevel(levels: readonly number[], level: number): number[] {
  const clamped = Math.min(LEVEL_MAX, Math.max(0, Math.round(level)));
  return [...levels, clamped].slice(-LIVE_LEVEL_BARS);
}

export function levelFromRms(rms: number): number {
  if (rms <= 0) {
    return 0;
  }
  const decibels = DECIBELS_PER_BEL * Math.log10(rms);
  return Math.min(LEVEL_MAX, Math.max(0, ((decibels - SILENCE_DB) / -SILENCE_DB) * LEVEL_MAX));
}
