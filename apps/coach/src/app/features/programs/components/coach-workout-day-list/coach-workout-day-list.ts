import { Component, inject, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { WEEKDAY_LABELS } from '../../models/coach-program-attributes';
import { WorkoutDayDraft, WorkoutDaySaveState } from '../../models/coach-workout-draft';

const WEEKDAY_ABBREVIATION_LENGTH = 2;

@Component({
  selector: 'coach-workout-day-list',
  imports: [ButtonDirective, TranslatePipe],
  templateUrl: './coach-workout-day-list.html',
  styleUrl: './coach-workout-day-list.css',
})
export class CoachWorkoutDayList {
  private readonly translator = inject(Translator);

  readonly days = input.required<readonly WorkoutDayDraft[]>();
  readonly selectedKey = input<string | null>(null);
  readonly saveStates = input.required<ReadonlyMap<string, WorkoutDaySaveState>>();
  readonly daySelected = output<string>();
  readonly addRequested = output<void>();

  protected weekday(day: WorkoutDayDraft): string {
    return this.translator.translate(WEEKDAY_LABELS[day.dayOfWeek]);
  }

  protected abbreviation(day: WorkoutDayDraft): string {
    return this.weekday(day).slice(0, WEEKDAY_ABBREVIATION_LENGTH);
  }
}
