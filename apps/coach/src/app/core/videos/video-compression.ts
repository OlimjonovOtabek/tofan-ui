export const COPY_MAX_SIDE = 1920;
export const COPY_MAX_FRAME_RATE = 30;
export const COPY_VIDEO_BITRATE = 8_000_000;
export const COPY_AUDIO_BITRATE = 128_000;
const UNTOUCHED_MAX_BYTES = 200 * 1024 * 1024;

export interface VideoTraits {
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly highDynamicRange: boolean;
}

export interface VideoSize {
  readonly width: number;
  readonly height: number;
}

export function isWorthCompressing(video: VideoTraits): boolean {
  if (video.highDynamicRange) {
    return false;
  }
  return Math.max(video.width, video.height) > COPY_MAX_SIDE || video.bytes > UNTOUCHED_MAX_BYTES;
}

export function copySize(video: VideoSize): VideoSize {
  const scale = Math.min(1, COPY_MAX_SIDE / Math.max(video.width, video.height));
  return { width: evenSide(video.width * scale), height: evenSide(video.height * scale) };
}

export function copyFrameRate(sourceFrameRate: number): number {
  return Math.min(COPY_MAX_FRAME_RATE, sourceFrameRate);
}

export function copyFileName(sourceName: string): string {
  const dot = sourceName.lastIndexOf('.');
  return `${dot === -1 ? sourceName : sourceName.slice(0, dot)}.mp4`;
}

function evenSide(side: number): number {
  return Math.max(2, Math.round(side / 2) * 2);
}
