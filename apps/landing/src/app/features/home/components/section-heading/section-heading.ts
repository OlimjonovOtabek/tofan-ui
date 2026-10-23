import { Component, input } from '@angular/core';
import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';

@Component({
  selector: 'landing-section-heading',
  imports: [LandingTranslatePipe],
  template: `
    <p class="eyebrow">{{ eyebrow() | t }}</p>
    <h2 class="section-title">{{ title() | t }}</h2>
    @if (text(); as text) {
      <p class="section-text">{{ text | t }}</p>
    }
  `,
  styleUrl: './section-heading.css',
})
export class SectionHeading {
  readonly eyebrow = input.required<LandingKey>();
  readonly title = input.required<LandingKey>();
  readonly text = input<LandingKey>();
}
