import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslationKey } from '@core/i18n/dictionary';
import { Progress } from '../ui/progress/progress';
import { VideoUploadPhase, wholePercent } from './video-upload';
import { VideoUploadsStore } from './video-uploads.store';

const PHASE_TITLES: Readonly<Record<VideoUploadPhase, TranslationKey>> = {
  preparing: 'coachApp.videoUpload.preparing',
  sending: 'coachApp.videoUpload.sending',
  saving: 'coachApp.videoUpload.saving',
};

@Component({
  selector: 'coach-video-upload-bar',
  imports: [TranslatePipe, Progress],
  templateUrl: './video-upload-bar.html',
  styleUrl: './video-upload-bar.css',
})
export class VideoUploadBar {
  private readonly uploads = inject(VideoUploadsStore);
  private readonly translator = inject(Translator);
  private readonly router = inject(Router);

  readonly raised = input(false);

  protected readonly summary = this.uploads.summary;
  protected readonly detail = computed(() => {
    const summary = this.summary();
    if (summary === null || summary.progress === null) {
      return '';
    }
    const percent = wholePercent(summary.progress);
    return summary.count > 1
      ? this.translator.translate('coachApp.videoUpload.progressMany', {
          count: summary.count,
          percent,
        })
      : `${percent}%`;
  });

  protected titleOf(phase: VideoUploadPhase): TranslationKey {
    return PHASE_TITLES[phase];
  }

  protected open(link: string): void {
    void this.router.navigateByUrl(link);
  }
}
