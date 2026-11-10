import { Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-collection-status-tag',
  imports: [TranslatePipe],
  template: `
    @if (published()) {
      <span class="c-tag c-tag--success c-tag--dot">{{
        'coachApp.videoCollections.published' | t
      }}</span>
    } @else {
      <span class="c-tag c-tag--neutral">{{ 'coachApp.videoCollections.draft' | t }}</span>
    }
  `,
})
export class CollectionStatusTag {
  readonly published = input.required<boolean>();
}
