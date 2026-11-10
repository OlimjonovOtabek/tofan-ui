import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import {
  CollectionText,
  VideoCollection,
  collectionLink,
  collectionUploadGroup,
  hasRoomForVideo,
  moved,
} from './models/video-collection';
import { VideoCollectionsService } from './services/video-collections.service';

export type CollectionAction = 'edit' | 'publish' | 'delete';

@Injectable()
export class VideoCollectionStore {
  private readonly service = inject(VideoCollectionsService);
  private readonly uploads = inject(VideoUploadsStore);
  private readonly statuses = inject(VideoStatusesStore);
  private readonly notifications = inject(NotificationService);
  private readonly id = signal<string | null>(null);
  private readonly group = computed(() => {
    const id = this.id();
    return id === null ? null : collectionUploadGroup(id);
  });

  readonly collection = signal<VideoCollection | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly action = signal<CollectionAction | null>(null);
  readonly busy = computed(() => this.action() !== null);
  readonly uploadProgress = computed(() => {
    const group = this.group();
    return group === null ? null : this.uploads.progressIn(group);
  });
  readonly preparing = computed(() => {
    const group = this.group();
    return group !== null && this.uploads.preparingIn(group);
  });
  readonly hasRoom = computed(() =>
    hasRoomForVideo(this.collection()?.videos.length ?? 0, this.uploadProgress() !== null),
  );

  constructor() {
    this.uploads.saves$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((result) => {
      if (result.group === this.group() && result.succeeded) {
        void this.reload();
      }
    });
  }

  async load(id: string): Promise<void> {
    this.id.set(id);
    this.loadError.set(null);
    try {
      this.show(await this.service.get(id));
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  update(text: CollectionText): Promise<boolean> {
    return this.run('edit', (id) => this.service.update(id, text));
  }

  async togglePublished(): Promise<boolean> {
    const collection = this.collection();
    if (collection === null) {
      return false;
    }
    if (!collection.isPublished && collection.videos.length === 0) {
      this.notifications.failure('coachApp.videoCollections.publishEmpty');
      return false;
    }
    const published = !collection.isPublished;
    const done = await this.run('publish', (id) => this.service.setPublished(id, published));
    if (done && published) {
      this.notifications.success('coachApp.videoCollections.publishedMessage');
    }
    return done;
  }

  delete(): Promise<boolean> {
    return this.run('delete', (id) => this.service.delete(id), false);
  }

  addVideo(file: File): void {
    const id = this.id();
    const group = this.group();
    if (id === null || group === null || this.busy() || !this.hasRoom()) {
      return;
    }
    const target = { group, link: collectionLink(id) };
    const upload = this.uploads.start(file, target);
    this.uploads.saveWhenUploaded({
      ...target,
      ids: [upload],
      tag: id,
      save: (fileIds) => this.service.addVideo(id, fileIds[upload]),
    });
  }

  updateVideo(videoId: string, text: CollectionText): Promise<boolean> {
    return this.run('edit', (id) => this.service.updateVideo(id, videoId, text));
  }

  deleteVideo(videoId: string): Promise<boolean> {
    return this.run('edit', (id) => this.service.deleteVideo(id, videoId));
  }

  async reorder(from: number, to: number): Promise<void> {
    const collection = this.collection();
    const videos = collection === null ? null : moved(collection.videos, from, to);
    if (collection === null || videos === null || this.busy()) {
      return;
    }
    this.collection.set({ ...collection, videos });
    const done = await this.run('edit', (id) =>
      this.service.reorderVideos(
        id,
        videos.map((video) => video.id),
      ),
    );
    if (!done) {
      this.collection.set(collection);
    }
  }

  private async run(
    action: CollectionAction,
    change: (id: string) => Promise<void>,
    reload = true,
  ): Promise<boolean> {
    const id = this.id();
    if (id === null || this.busy()) {
      return false;
    }
    this.action.set(action);
    try {
      await change(id);
      if (reload) {
        this.show(await this.service.get(id));
      }
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.action.set(null);
    }
  }

  private async reload(): Promise<void> {
    const id = this.id();
    if (id === null) {
      return;
    }
    try {
      this.show(await this.service.get(id));
    } catch (error) {
      this.notifications.error(error);
    }
  }

  private show(collection: VideoCollection): void {
    this.collection.set(collection);
    void this.statuses.track(collection.videos.map((video) => video.fileId));
  }
}
