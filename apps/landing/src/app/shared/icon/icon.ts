import { Component, computed, input } from '@angular/core';
import { IconName } from './icon-name';

@Component({
  selector: 'landing-icon',
  template: `<svg aria-hidden="true" focusable="false"><use [attr.href]="href()" /></svg>`,
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<IconName>();

  protected readonly href = computed(() => `#icon-${this.name()}`);
}
