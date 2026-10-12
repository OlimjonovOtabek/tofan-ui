import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputText } from '@openng/optimus-ui/inputtext';
import { SelectField } from '@shared/components/select-field/select-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import {
  WEEKDAY_OPTIONS,
  WORKOUT_SPLIT_OPTIONS,
  Weekday,
  WorkoutSplit,
} from '../../models/coach-program-attributes';
import { WorkoutDayDraft, WorkoutDaySettings } from '../../models/coach-workout-draft';

const DEFAULT_DAY_OF_WEEK: Weekday = 'monday';
const DEFAULT_SPLIT_TYPE: WorkoutSplit = 'fullBody';

@Component({
  selector: 'coach-workout-day-dialog',
  imports: [ButtonDirective, Dialog, InputText, SelectField, ToggleField, TranslatePipe],
  templateUrl: './coach-workout-day-dialog.html',
  styleUrl: './coach-workout-day-dialog.css',
})
export class CoachWorkoutDayDialog {
  private readonly translator = inject(Translator);

  readonly visible = input(false);
  readonly day = input<WorkoutDayDraft | null>(null);
  readonly closed = output<void>();
  readonly confirmed = output<WorkoutDaySettings>();
  readonly removed = output<void>();

  protected readonly dayOptions = computed(() => this.translator.options(WEEKDAY_OPTIONS));
  protected readonly splitOptions = computed(() => this.translator.options(WORKOUT_SPLIT_OPTIONS));
  protected readonly title = linkedSignal(() => this.day()?.title ?? '');
  protected readonly dayOfWeek = linkedSignal<Weekday>(() => this.day()?.dayOfWeek ?? DEFAULT_DAY_OF_WEEK);
  protected readonly splitType = linkedSignal<WorkoutSplit>(() => this.day()?.splitType ?? DEFAULT_SPLIT_TYPE);
  protected readonly restDay = linkedSignal(() => this.day()?.isRestDay ?? false);
  protected readonly titleInvalid = signal(false);

  protected dayChanged(dayOfWeek: Weekday | null): void {
    this.dayOfWeek.set(dayOfWeek ?? DEFAULT_DAY_OF_WEEK);
  }

  protected splitChanged(splitType: WorkoutSplit | null): void {
    this.splitType.set(splitType ?? DEFAULT_SPLIT_TYPE);
  }

  protected titleChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.title.set(input.value);
    }
  }

  protected submit(): void {
    const title = this.title().trim();
    if (title.length === 0) {
      this.titleInvalid.set(true);
      return;
    }
    this.titleInvalid.set(false);
    this.confirmed.emit({
      title,
      dayOfWeek: this.dayOfWeek(),
      splitType: this.splitType(),
      isRestDay: this.restDay(),
    });
    this.title.set('');
    this.restDay.set(false);
  }

  protected close(): void {
    this.titleInvalid.set(false);
    this.closed.emit();
  }
}
