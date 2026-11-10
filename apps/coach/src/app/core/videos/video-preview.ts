import { Component, input, linkedSignal, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '../ui/icon/icon';

@Component({
  selector: 'coach-video-preview',
  imports: [Icon, TranslatePipe],
  template: `
    <button
      type="button"
      class="preview"
      [attr.aria-label]="'coachApp.day.videoWatch' | t"
      (click)="watch.emit()"
    >
      @if (posterUrl(); as poster) {
        @if (!posterFailed()) {
          <img class="poster" [src]="poster" alt="" (error)="posterFailed.set(true)" />
        }
      }
      <span class="play"><coach-icon name="play" /></span>
      <span class="badge"><ng-content /></span>
    </button>
  `,
  styles: `
    .preview {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      padding: 0;
      border: 0;
      border-radius: var(--c-radius-tile);
      background: var(--c-video);
      cursor: pointer;
    }

    .poster {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play {
      position: relative;
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--c-scrim);
      color: var(--c-on-video);
      --icon-size: 24px;
    }

    .badge {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  `,
})
export class VideoPreview {
  readonly posterUrl = input<string | null>(null);
  readonly watch = output<void>();

  protected readonly posterFailed = linkedSignal({
    source: this.posterUrl,
    computation: () => false,
  });
}
