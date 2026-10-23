import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '../ui/icon/icon';
import { VideoPlayerService } from './video-player.service';

const HLS_TYPE = 'application/vnd.apple.mpegurl';

@Component({
  selector: 'coach-video-player',
  imports: [Icon, TranslatePipe],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer {
  private readonly player = inject(VideoPlayerService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly source = this.player.source;
  protected readonly failed = signal(false);
  protected readonly url = computed(() => {
    const source = this.source();
    if (source === null) {
      return null;
    }
    return source.localUrl ?? source.videoUrl ?? (supportsHls() ? source.hlsUrl : null);
  });

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.source() !== null && !dialog.open) {
        this.failed.set(false);
        dialog.showModal();
      } else if (this.source() === null && dialog.open) {
        dialog.close();
      }
    });
  }

  protected close(): void {
    this.player.close();
  }
}

function supportsHls(): boolean {
  return document.createElement('video').canPlayType(HLS_TYPE) !== '';
}
