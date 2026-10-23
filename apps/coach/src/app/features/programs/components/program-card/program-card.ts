import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PillButton } from '@coach/core/ui/pill-button/pill-button';

@Component({
  selector: 'coach-program-card',
  imports: [TranslatePipe, PillButton],
  template: `
    <button type="button" class="open c-row-button" (click)="open.emit()">
      <span class="head">
        <span class="t-title3 title">{{ title() }}</span>
        @if (published()) {
          <span class="c-tag c-tag--success">{{ 'coachApp.programs.statusPublished' | t }}</span>
        } @else {
          <span class="c-tag c-tag--warning">{{ 'coachApp.programs.statusDraft' | t }}</span>
        }
      </span>
      <span class="meta">
        @if (goal(); as goal) {
          <span class="c-tag">{{ goal }}</span>
        }
        <span class="t-base4 tone-secondary coach-ellipsis">{{ meta() }}</span>
      </span>
    </button>
    @if (!published()) {
      <button
        coachPill="soft"
        type="button"
        class="publish"
        [loading]="publishing()"
        (click)="publish.emit()"
      >
        {{ 'coachApp.programs.publish' | t }}
      </button>
    }
  `,
  styleUrl: './program-card.css',
  host: { class: 'c-card c-pressable' },
})
export class ProgramCard {
  readonly title = input.required<string>();
  readonly published = input.required<boolean>();
  readonly goal = input<string | null>(null);
  readonly meta = input('');
  readonly publishing = input(false);
  readonly open = output<void>();
  readonly publish = output<void>();
}
