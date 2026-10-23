import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@coach/core/ui/button/button';

@Component({
  selector: 'coach-publish-actions',
  imports: [TranslatePipe, Button],
  template: `
    <button
      [coachButton]="published() ? 'secondary' : 'primary'"
      type="button"
      [loading]="publishing()"
      [disabled]="deleting()"
      (click)="togglePublished.emit()"
    >
      {{ (published() ? 'coachApp.workoutProgram.unpublish' : 'coachApp.programs.publish') | t }}
    </button>
    @if (published()) {
      <p class="t-base4 tone-secondary">
        {{ 'coachApp.programs.programDeleteUnpublishFirst' | t }}
      </p>
    } @else {
      <button
        coachButton="destructive"
        type="button"
        [loading]="deleting()"
        [disabled]="publishing()"
        (click)="delete.emit()"
      >
        {{ 'coachApp.workoutProgram.delete' | t }}
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    p {
      text-align: center;
    }
  `,
})
export class PublishActions {
  readonly published = input.required<boolean>();
  readonly publishing = input(false);
  readonly deleting = input(false);
  readonly togglePublished = output<void>();
  readonly delete = output<void>();
}
