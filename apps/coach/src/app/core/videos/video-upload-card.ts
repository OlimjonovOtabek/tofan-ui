import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Progress } from '../ui/progress/progress';
import { wholePercent } from './video-upload';

@Component({
  selector: 'coach-video-upload-card',
  imports: [TranslatePipe, Progress],
  template: `
    <div class="c-card card">
      <span class="t-base4 font-medium tone-secondary">{{
        (preparing() ? 'coachApp.day.videoPreparing' : 'coachApp.day.videoUploading')
          | t: { percent: percent() }
      }}</span>
      <coach-progress [value]="progress()" />
    </div>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `,
})
export class VideoUploadCard {
  readonly progress = input.required<number>();
  readonly preparing = input(false);

  protected readonly percent = computed(() => wholePercent(this.progress()));
}
