import {
  CollectionText,
  CollectionVideo,
  VideoCollection,
  VideoCollectionSummary,
} from '../models/video-collection';
import {
  CollectionVideoResponse,
  SaveVideoCollectionRequest,
  TrainerVideoCollectionDetailResponse,
  TrainerVideoCollectionResponse,
  UpdateCollectionVideoRequest,
} from './video-collection.dto';

export type MediaUrl = (path: string | null) => string | null;

export function toVideoCollectionSummary(
  response: TrainerVideoCollectionResponse,
): VideoCollectionSummary {
  return {
    id: response.id,
    title: response.title.trim(),
    description: response.description?.trim() ?? '',
    isPublished: response.isPublished,
    videoCount: response.videoCount,
  };
}

export function toVideoCollection(
  response: TrainerVideoCollectionDetailResponse,
  media: MediaUrl,
): VideoCollection {
  return {
    id: response.id,
    title: response.title.trim(),
    description: response.description?.trim() ?? '',
    isPublished: response.isPublished,
    videos: [...response.videos]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((video) => toCollectionVideo(video, media)),
  };
}

export function toSaveVideoCollectionRequest(text: CollectionText): SaveVideoCollectionRequest {
  return { title: text.title.trim(), description: orNull(text.text) };
}

export function toUpdateCollectionVideoRequest(text: CollectionText): UpdateCollectionVideoRequest {
  return { title: orNull(text.title), note: orNull(text.text) };
}

function toCollectionVideo(response: CollectionVideoResponse, media: MediaUrl): CollectionVideo {
  return {
    id: response.id,
    fileId: response.fileId,
    title: response.title?.trim() ?? '',
    note: response.note?.trim() ?? '',
    videoUrl: media(response.videoUrl),
    hlsUrl: media(response.hlsUrl),
    posterUrl: media(response.posterUrl),
  };
}

function orNull(value: string): string | null {
  const text = value.trim();
  return text === '' ? null : text;
}
