export const MIN_RECORDING_MS = 1000;

const MILLISECONDS_PER_SECOND = 1000;

export interface RecordingFormat {
  readonly mimeType: string;
  readonly fileName: string;
}

export interface RecordingState {
  readonly elapsedMs: number;
  readonly levels: readonly number[];
}

export function pickRecordingFormat(
  formats: readonly RecordingFormat[],
  isSupported: (mimeType: string) => boolean,
): RecordingFormat | null {
  return formats.find((format) => isSupported(format.mimeType)) ?? null;
}

export function isLongEnough(elapsedMs: number): boolean {
  return elapsedMs >= MIN_RECORDING_MS;
}

export function recordedSeconds(elapsedMs: number): number {
  return Math.max(1, Math.round(elapsedMs / MILLISECONDS_PER_SECOND));
}

export function remainingShare(elapsedMs: number, maxMs: number): number {
  return maxMs <= 0 ? 0 : Math.max(0, 1 - elapsedMs / maxMs);
}
