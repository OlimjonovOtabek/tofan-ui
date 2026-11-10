import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { VideoUploadsStore } from '@coach/core/videos/video-uploads.store';
import { POSTS_LINK, POSTS_UPLOAD_GROUP } from './models/post';
import { PostDraft, PostVideo, storedFileIdOf } from './models/post-draft';
import { PostsService } from './services/posts.service';

export type PostSaveOutcome = 'saved' | 'queued';

@Injectable()
export class PostEditorStore {
  private readonly service = inject(PostsService);
  private readonly uploads = inject(VideoUploadsStore);
  private readonly notifications = inject(NotificationService);

  readonly saving = signal(false);
  readonly saveError = signal<ErrorMessage | null>(null);

  async save(
    postId: string | null,
    draft: PostDraft,
    video: PostVideo,
  ): Promise<PostSaveOutcome | null> {
    if (this.saving()) {
      return null;
    }
    if (video.kind === 'picked') {
      this.queue(postId, draft, video.file);
      return 'queued';
    }
    this.saving.set(true);
    this.saveError.set(null);
    try {
      await this.send(postId, draft, storedFileIdOf(video));
      this.notifications.success(
        postId === null ? 'coachApp.posts.published' : 'coachApp.posts.saved',
      );
      return 'saved';
    } catch (error) {
      this.saveError.set(toErrorMessage(error));
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  private queue(postId: string | null, draft: PostDraft, file: File): void {
    const target = { group: POSTS_UPLOAD_GROUP, link: POSTS_LINK };
    const id = this.uploads.start(file, target);
    this.uploads.saveWhenUploaded({
      ...target,
      ids: [id],
      ...(postId === null ? {} : { tag: postId }),
      save: (fileIds) => this.send(postId, draft, fileIds[id] ?? null),
    });
    this.notifications.success('coachApp.posts.queued');
  }

  private async send(
    postId: string | null,
    draft: PostDraft,
    fileId: string | null,
  ): Promise<void> {
    if (postId === null) {
      await this.service.create(draft, fileId);
      return;
    }
    await this.service.update(postId, draft, fileId);
  }
}
