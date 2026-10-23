import { Component, input } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { APP_STORES } from '../../models/app-stores';

export type StoreBadgeTone = 'light' | 'dark';

@Component({
  selector: 'landing-store-badges',
  imports: [LandingTranslatePipe, Icon],
  template: `
    @for (store of stores; track store.name) {
      <a class="badge" target="_blank" rel="noopener" [attr.href]="store.href">
        <landing-icon [name]="store.icon" />
        <span class="labels">
          <span class="caption">{{ 'store.caption' | t }}</span>
          <span class="name">{{ store.name | t }}</span>
        </span>
      </a>
    }
  `,
  styleUrl: './store-badges.css',
  host: { '[class.dark]': "tone() === 'dark'" },
})
export class StoreBadges {
  readonly tone = input<StoreBadgeTone>('light');

  protected readonly stores = APP_STORES;
}
