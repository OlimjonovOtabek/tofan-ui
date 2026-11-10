import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '@coach/core/ui/icon/icon';
import { VideoStreamStatus, canWatch } from '@coach/core/videos/video';
import { VideoStatusTag } from '@coach/core/videos/video-status-tag';
import { CollectionVideo } from '../../models/video-collection';

@Component({
  selector: 'coach-collection-video-tile',
  imports: [TranslatePipe, Icon, VideoStatusTag],
  templateUrl: './collection-video-tile.html',
  styleUrl: './collection-video-tile.css',
})
export class CollectionVideoTile {
  readonly video = input.required<CollectionVideo>();
  readonly title = input.required<string>();
  readonly status = input<VideoStreamStatus | null>(null);
  readonly busy = input(false);
  readonly watch = output<void>();
  readonly more = output<void>();

  protected readonly watchable = computed(() => canWatch(this.video()));
  protected readonly flagged = computed(
    () => this.status() === 'pending' || this.status() === 'failed',
  );
}
