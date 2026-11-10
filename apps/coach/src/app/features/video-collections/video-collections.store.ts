import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import {
  CollectionText,
  VideoCollectionSummary,
  hasRoomForCollection,
  moved,
} from './models/video-collection';
import { VideoCollectionsService } from './services/video-collections.service';

@Injectable()
export class VideoCollectionsStore {
  private readonly service = inject(VideoCollectionsService);
  private readonly notifications = inject(NotificationService);

  readonly collections = signal<readonly VideoCollectionSummary[] | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly creating = signal(false);
  readonly reordering = signal(false);
  readonly hasRoom = computed(() => hasRoomForCollection(this.collections()?.length ?? 0));

  async load(): Promise<void> {
    this.loadError.set(null);
    try {
      this.collections.set(await this.service.list());
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  async create(text: CollectionText): Promise<string | null> {
    if (this.creating()) {
      return null;
    }
    this.creating.set(true);
    try {
      return await this.service.create(text);
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.creating.set(false);
    }
  }

  async reorder(from: number, to: number): Promise<void> {
    const previous = this.collections();
    const next = previous === null ? null : moved(previous, from, to);
    if (next === null || this.reordering()) {
      return;
    }
    this.collections.set(next);
    this.reordering.set(true);
    try {
      await this.service.reorder(next.map((collection) => collection.id));
    } catch (error) {
      this.collections.set(previous);
      this.notifications.error(error);
    } finally {
      this.reordering.set(false);
    }
  }
}
