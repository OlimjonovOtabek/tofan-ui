import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Note } from '@coach/core/ui/note/note';
import { TextButton } from '@coach/core/ui/text-button/text-button';

@Component({
  selector: 'coach-program-summary',
  imports: [TranslatePipe, Note, TextButton],
  template: `
    <div class="head">
      <h2 class="t-title3">{{ title() }}</h2>
      @if (published()) {
        <span class="c-tag c-tag--success">{{ 'coachApp.programs.statusPublished' | t }}</span>
      } @else {
        <span class="c-tag c-tag--warning">{{ 'coachApp.programs.statusDraft' | t }}</span>
      }
    </div>
    <div class="meta">
      @if (goal(); as goal) {
        <span class="c-tag">{{ goal }}</span>
      }
      <span class="t-base4 tone-secondary">{{ meta() }}</span>
    </div>
    @if (published()) {
      <coach-note
        class="note"
        [plain]="true"
        [text]="'coachApp.workoutProgram.publishedNote' | t"
      />
    }
    <button coachTextButton type="button" class="edit" (click)="edit.emit()">
      {{ editLabel() }}
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }
    .head {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    h2 {
      flex: 1;
      min-width: 0;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }
    .note {
      margin-top: 12px;
    }
    .edit {
      align-self: flex-end;
      margin-top: 4px;
    }
  `,
  host: { class: 'c-card' },
})
export class ProgramSummary {
  readonly title = input.required<string>();
  readonly published = input.required<boolean>();
  readonly goal = input<string | null>(null);
  readonly meta = input('');
  readonly editLabel = input.required<string>();
  readonly edit = output<void>();
}
