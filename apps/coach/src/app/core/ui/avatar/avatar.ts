import { Component, input, linkedSignal } from '@angular/core';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarTone = 'accent' | 'warning';

@Component({
  selector: 'coach-avatar',
  template: `
    @if (imageUrl() && !failed()) {
      <img [src]="imageUrl()" alt="" (error)="failed.set(true)" />
    } @else {
      <span class="initials">{{ initials() }}</span>
    }
  `,
  styleUrl: './avatar.css',
  host: {
    '[class]': "'size-' + size() + ' tone-' + tone()",
    '[class.is-rounded]': 'rounded()',
    'aria-hidden': 'true',
  },
})
export class Avatar {
  readonly initials = input.required<string>();
  readonly imageUrl = input<string | null>(null);
  readonly size = input<AvatarSize>('medium');
  readonly tone = input<AvatarTone>('accent');
  readonly rounded = input(false);

  protected readonly failed = linkedSignal({ source: this.imageUrl, computation: () => false });
}
