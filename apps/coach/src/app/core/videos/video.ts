export type VideoStreamStatus = 'none' | 'pending' | 'ready' | 'failed';

export interface VideoDetails {
  readonly fileId: string;
  readonly status: VideoStreamStatus;
  readonly durationSeconds: number | null;
}

export interface VideoSource {
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
  readonly localUrl?: string | null;
}

export function canWatch(source: VideoSource): boolean {
  return Boolean(source.localUrl || source.videoUrl || source.hlsUrl);
}

export function formatVideoDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
