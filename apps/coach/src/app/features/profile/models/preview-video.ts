export const MAX_PREVIEW_VIDEOS = 5;
export const PREVIEW_NAME_MAX = 200;

export interface PreviewVideo {
  readonly id: string;
  readonly fileId: string;
  readonly name: string;
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
}

export function isFull(videos: readonly PreviewVideo[]): boolean {
  return videos.length >= MAX_PREVIEW_VIDEOS;
}
