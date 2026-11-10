import { Component, computed, input, output } from '@angular/core';
import { AppLocale } from '@core/i18n/locale';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { Icon } from '@coach/core/ui/icon/icon';
import { VideoStreamStatus } from '@coach/core/videos/video';
import { VideoPreview } from '@coach/core/videos/video-preview';
import { VideoStatusTag } from '@coach/core/videos/video-status-tag';
import { Post, isPostEdited, postDateLabel } from '../../models/post';

@Component({
  selector: 'coach-post-card',
  imports: [TranslatePipe, Avatar, Icon, VideoPreview, VideoStatusTag],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  readonly post = input.required<Post>();
  readonly now = input.required<Date>();
  readonly locale = input.required<AppLocale>();
  readonly status = input<VideoStreamStatus | null>(null);
  readonly busy = input(false);
  readonly watch = output<void>();
  readonly more = output<void>();

  protected readonly date = computed(() =>
    postDateLabel(this.post().createdOn, this.now(), this.locale()),
  );
  protected readonly edited = computed(() => isPostEdited(this.post()));
  protected readonly flagged = computed(
    () => this.status() === 'pending' || this.status() === 'failed',
  );
}
