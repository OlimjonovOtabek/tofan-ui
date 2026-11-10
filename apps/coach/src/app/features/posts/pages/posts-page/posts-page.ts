import { Component, inject, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Sheet } from '@coach/core/ui/sheet/sheet';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { VideoPlayerService } from '@coach/core/videos/video-player.service';
import { VideoStatusesStore } from '@coach/core/videos/video-statuses.store';
import { VideoUploadCard } from '@coach/core/videos/video-upload-card';
import { PostCard } from '../../components/post-card/post-card';
import { PostEditor } from '../../components/post-editor/post-editor';
import { Post } from '../../models/post';
import { PostsStore } from '../../posts.store';
import { PostSaveOutcome } from '../../post-editor.store';

interface PostEditing {
  readonly post: Post | null;
}

@Component({
  selector: 'coach-posts-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    Button,
    EmptyState,
    PostCard,
    PostEditor,
    Sheet,
    Spinner,
    VideoUploadCard,
  ],
  providers: [PostsStore, VideoStatusesStore],
  templateUrl: './posts-page.html',
  styleUrl: './posts-page.css',
})
export class PostsPage {
  protected readonly store = inject(PostsStore);
  protected readonly statuses = inject(VideoStatusesStore);
  protected readonly locale = inject(LocaleStore).locale;
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly player = inject(VideoPlayerService);

  protected readonly now = signal(new Date());
  protected readonly editing = signal<PostEditing | null>(null);

  constructor() {
    void this.store.load();
  }

  protected create(): void {
    this.editing.set({ post: null });
  }

  protected editorToggled(open: boolean): void {
    if (!open) {
      this.editing.set(null);
    }
  }

  protected saved(outcome: PostSaveOutcome): void {
    this.editing.set(null);
    if (outcome === 'saved') {
      this.now.set(new Date());
      void this.store.refresh();
    }
  }

  protected watch(post: Post): void {
    if (post.video !== null) {
      this.player.show(post.video);
    }
  }

  protected async more(post: Post): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    await this.sheets.actions(post.title, [
      { label: t('coachApp.common.edit'), icon: 'edit', run: () => this.editing.set({ post }) },
      {
        label: t('coachApp.posts.delete'),
        icon: 'trash',
        destructive: true,
        run: () => void this.remove(post),
      },
    ]);
  }

  private async remove(post: Post): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const confirmed = await this.sheets.confirm({
      title: t('coachApp.posts.deleteTitle'),
      message: t('coachApp.posts.deleteMessage'),
      confirmLabel: t('coachApp.posts.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      await this.store.delete(post.id);
    }
  }
}
