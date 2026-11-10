import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '@coach/core/ui/icon/icon';
import { VideoCollection } from '../../models/video-collection';
import { CollectionStatusTag } from '../collection-status-tag/collection-status-tag';

@Component({
  selector: 'coach-collection-header',
  imports: [TranslatePipe, Icon, CollectionStatusTag],
  template: `
    <section class="c-card header">
      <div class="top">
        <coach-collection-status-tag [published]="collection().isPublished" />
        <button
          type="button"
          class="edit"
          [disabled]="busy()"
          [attr.aria-label]="'coachApp.videoCollections.editTitle' | t"
          (click)="edit.emit()"
        >
          <coach-icon name="edit" />
        </button>
      </div>
      <h2 class="t-title4 title">{{ collection().title }}</h2>
      @if (collection().description) {
        <p class="t-base4 tone-secondary description">{{ collection().description }}</p>
      }
    </section>
  `,
  styles: `
    .header {
      display: flex;
      flex-direction: column;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .edit {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--c-border);
      border-radius: 50%;
      background: var(--c-surface);
      color: var(--c-text);
      --icon-size: 16px;
    }

    .edit:disabled {
      opacity: 0.5;
    }

    .title {
      margin: 8px 0 0;
      overflow-wrap: anywhere;
    }

    .description {
      margin: 6px 0 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
  `,
})
export class CollectionHeader {
  readonly collection = input.required<VideoCollection>();
  readonly busy = input(false);
  readonly edit = output<void>();
}
