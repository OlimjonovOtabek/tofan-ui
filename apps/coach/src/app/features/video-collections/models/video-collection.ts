import { VideoSource } from '@coach/core/videos/video';

export const MAX_COLLECTIONS = 20;
export const MAX_COLLECTION_VIDEOS = 50;
export const COLLECTION_TITLE_MAX = 200;
export const COLLECTION_DESCRIPTION_MAX = 2000;
export const COLLECTION_VIDEO_TITLE_MAX = 200;
export const COLLECTION_VIDEO_NOTE_MAX = 1000;
export const COLLECTIONS_LINK = '/profile/video-collections';

export interface VideoCollectionSummary {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isPublished: boolean;
  readonly videoCount: number;
}

export interface CollectionVideo extends VideoSource {
  readonly id: string;
  readonly fileId: string;
  readonly title: string;
  readonly note: string;
}

export interface VideoCollection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isPublished: boolean;
  readonly videos: readonly CollectionVideo[];
}

export interface CollectionText {
  readonly title: string;
  readonly text: string;
}

export function collectionUploadGroup(collectionId: string): string {
  return `video-collection:${collectionId}`;
}

export function collectionLink(collectionId: string): string {
  return `${COLLECTIONS_LINK}/${encodeURIComponent(collectionId)}`;
}

export function hasRoomForCollection(count: number): boolean {
  return count < MAX_COLLECTIONS;
}

export function hasRoomForVideo(videoCount: number, uploading: boolean): boolean {
  return videoCount + (uploading ? 1 : 0) < MAX_COLLECTION_VIDEOS;
}

export function moved<T>(items: readonly T[], from: number, to: number): T[] | null {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return null;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
