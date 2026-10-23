import { Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { VideoStreamStatus } from './video';

@Component({
  selector: 'coach-video-status-tag',
  imports: [TranslatePipe],
  template: `
    @switch (status()) {
      @case ('pending') {
        <span class="c-tag">{{ 'coachApp.video.statusProcessing' | t }}</span>
      }
      @case ('failed') {
        <span class="c-tag c-tag--warning">{{ 'coachApp.video.statusFailed' | t }}</span>
      }
      @default {
        <span class="c-tag c-tag--success">{{ 'coachApp.day.videoReady' | t }}</span>
      }
    }
  `,
})
export class VideoStatusTag {
  readonly status = input<VideoStreamStatus | null>(null);
}
