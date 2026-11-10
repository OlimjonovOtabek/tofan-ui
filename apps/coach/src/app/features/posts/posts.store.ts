import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import {
  POSTS_UPLOAD_GROUP,
  PostsPage,
  appendPosts,
  hasMorePosts,
  withoutPost,
} from './models/post';
import { PostsService } from './services/posts.service';

@Injectable()
export class PostsStore {
  private readonly service = inject(PostsService);
  private readonly uploads = inject(VideoUploadsStore);
  private readonly statuses = inject(VideoStatusesStore);
  private readonly notifications = inject(NotificationService);

  readonly page = signal<PostsPage | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly loadingMore = signal(false);
  readonly busy = signal(false);
  readonly hasMore = computed(() => {
    const page = this.page();
    return page !== null && hasMorePosts(page);
  });
  readonly uploadProgress = computed(() => this.uploads.progressIn(POSTS_UPLOAD_GROUP));
  readonly preparing = computed(() => this.uploads.preparingIn(POSTS_UPLOAD_GROUP));

  constructor() {
    this.uploads.saves$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((result) => {
      if (result.group === POSTS_UPLOAD_GROUP && result.succeeded) {
        void this.refresh();
      }
    });
  }

  async load(): Promise<void> {
    this.loadError.set(null);
    try {
      this.show(await this.service.list(0));
    } catch (error) {
      this.loadError.set(toErrorMessage(error));
    }
  }

  async refresh(): Promise<void> {
    try {
      this.show(await this.service.list(0));
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async loadMore(): Promise<void> {
    const page = this.page();
    if (page === null || !hasMorePosts(page) || this.loadingMore()) {
      return;
    }
    this.loadingMore.set(true);
    try {
      const next = await this.service.list(page.posts.length);
      this.show({ posts: appendPosts(page.posts, next.posts), totalCount: next.totalCount });
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loadingMore.set(false);
    }
  }

  async delete(id: string): Promise<void> {
    const page = this.page();
    if (page === null || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await this.service.delete(id);
      this.page.set(withoutPost(page, id));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.busy.set(false);
    }
  }

  private show(page: PostsPage): void {
    this.page.set(page);
    void this.statuses.track(
      page.posts.flatMap((post) => (post.fileId === null ? [] : [post.fileId])),
    );
  }
}
