import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@coach/core/ui/button/button';
import { Note } from '@coach/core/ui/note/note';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { VideoPlayerService } from '@coach/core/videos/video-player.service';
import { VIDEO_FILE_ACCEPT } from '@coach/core/videos/video-upload';
import { VideoPreview } from '@coach/core/videos/video-preview';
import { Post } from '../../models/post';
import {
  NO_POST_VIDEO,
  PostDraft,
  PostVideo,
  hasPostContent,
  pickedPostVideo,
  postDraftOf,
  postVideoOf,
} from '../../models/post-draft';
import { PostEditorStore, PostSaveOutcome } from '../../post-editor.store';
import { postEditorSchema } from './post-editor.schema';

@Component({
  selector: 'coach-post-editor',
  imports: [FormField, FormRoot, TranslatePipe, MessagePipe, Button, Note, TextField, VideoPreview],
  providers: [PostEditorStore],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css',
})
export class PostEditor {
  protected readonly store = inject(PostEditorStore);
  private readonly player = inject(VideoPlayerService);
  private localUrl: string | null = null;

  readonly post = input<Post | null>(null);
  readonly done = output<PostSaveOutcome>();

  protected readonly draft = linkedSignal<PostDraft>(() => postDraftOf(this.post()));
  protected readonly video = linkedSignal<PostVideo>(() => postVideoOf(this.post()));
  protected readonly accept = VIDEO_FILE_ACCEPT;
  protected readonly posterUrl = computed(() => {
    const video = this.video();
    return video.kind === 'stored' ? video.source.posterUrl : null;
  });
  private readonly triedEmpty = signal(false);
  protected readonly contentMissing = computed(
    () => this.triedEmpty() && !hasPostContent(this.draft(), this.video()),
  );
  protected readonly postForm = form(this.draft, postEditorSchema, {
    submission: { action: () => this.save() },
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.releaseLocalUrl());
  }

  protected chosen(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) {
      return;
    }
    const file = input.files[0];
    input.value = '';
    this.releaseLocalUrl();
    this.localUrl = URL.createObjectURL(file);
    this.video.set(pickedPostVideo(file, this.localUrl));
  }

  protected removeVideo(): void {
    this.releaseLocalUrl();
    this.video.set(NO_POST_VIDEO);
  }

  protected watch(): void {
    const video = this.video();
    if (video.kind !== 'none') {
      this.player.show(video.source);
    }
  }

  private async save(): Promise<undefined> {
    if (!hasPostContent(this.draft(), this.video())) {
      this.triedEmpty.set(true);
      return undefined;
    }
    const outcome = await this.store.save(this.post()?.id ?? null, this.draft(), this.video());
    if (outcome !== null) {
      this.done.emit(outcome);
    }
    return undefined;
  }

  private releaseLocalUrl(): void {
    if (this.localUrl !== null) {
      URL.revokeObjectURL(this.localUrl);
      this.localUrl = null;
    }
  }
}
