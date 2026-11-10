import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import {
  CollectionText,
  VideoCollection,
  VideoCollectionSummary,
} from '../models/video-collection';
import {
  AddCollectionVideoRequest,
  TrainerVideoCollectionDetailResponse,
  TrainerVideoCollectionResponse,
} from './video-collection.dto';
import {
  MediaUrl,
  toSaveVideoCollectionRequest,
  toUpdateCollectionVideoRequest,
  toVideoCollection,
  toVideoCollectionSummary,
} from './video-collection.mapper';

const COLLECTIONS = '/coach/video-collections';

@Injectable({ providedIn: 'root' })
export class VideoCollectionsService {
  private readonly api = inject(ApiClient);
  private readonly media: MediaUrl = (path) => (path ? this.api.url(path) : null);

  async list(): Promise<VideoCollectionSummary[]> {
    const responses = await this.api.get<TrainerVideoCollectionResponse[]>(COLLECTIONS);
    return responses.map(toVideoCollectionSummary);
  }

  async get(id: string): Promise<VideoCollection> {
    const response = await this.api.get<TrainerVideoCollectionDetailResponse>(collection(id));
    return toVideoCollection(response, this.media);
  }

  create(text: CollectionText): Promise<string> {
    return this.api.post<string>(COLLECTIONS, toSaveVideoCollectionRequest(text));
  }

  async update(id: string, text: CollectionText): Promise<void> {
    await this.api.put(collection(id), toSaveVideoCollectionRequest(text));
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(collection(id));
  }

  async setPublished(id: string, published: boolean): Promise<void> {
    await this.api.post(`${collection(id)}/${published ? 'publish' : 'unpublish'}`);
  }

  async reorder(ids: readonly string[]): Promise<void> {
    await this.api.put(`${COLLECTIONS}/order`, { collectionIds: ids });
  }

  addVideo(id: string, fileId: string): Promise<string> {
    const request: AddCollectionVideoRequest = { fileId, title: null, note: null };
    return this.api.post<string>(`${collection(id)}/videos`, request);
  }

  async updateVideo(id: string, videoId: string, text: CollectionText): Promise<void> {
    await this.api.put(video(id, videoId), toUpdateCollectionVideoRequest(text));
  }

  async deleteVideo(id: string, videoId: string): Promise<void> {
    await this.api.delete(video(id, videoId));
  }

  async reorderVideos(id: string, videoIds: readonly string[]): Promise<void> {
    await this.api.put(`${collection(id)}/videos/order`, { videoIds });
  }
}

function collection(id: string): string {
  return `${COLLECTIONS}/${encodeURIComponent(id)}`;
}

function video(id: string, videoId: string): string {
  return `${collection(id)}/videos/${encodeURIComponent(videoId)}`;
}
