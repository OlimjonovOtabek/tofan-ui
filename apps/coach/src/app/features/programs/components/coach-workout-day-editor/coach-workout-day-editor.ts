import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { NumberField } from '@shared/components/number-field/number-field';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { WEEKDAY_LABELS, WORKOUT_SPLIT_LABELS } from '../../models/coach-program-attributes';
import { CoachWorkoutEditorStore } from '../../coach-workout-editor.store';
import { WorkoutDayDraft, WorkoutDayExerciseDraft } from '../../models/coach-workout-draft';

type ExerciseNumberField = 'targetSets' | 'restSeconds' | 'targetWeightKg';

@Component({
  selector: 'coach-workout-day-editor',
  imports: [ButtonDirective, InputText, NumberField, TranslatePipe],
  templateUrl: './coach-workout-day-editor.html',
  styleUrl: './coach-workout-day-editor.css',
})
export class CoachWorkoutDayEditor {
  private readonly store = inject(CoachWorkoutEditorStore);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore);

  readonly day = input.required<WorkoutDayDraft>();
  readonly settingsRequested = output<void>();
  readonly pickRequested = output<void>();
  readonly backRequested = output<void>();

  protected readonly subtitle = computed(() => {
    const day = this.day();
    const weekday = this.translator.translate(WEEKDAY_LABELS[day.dayOfWeek]);
    const split = this.translator.translate(WORKOUT_SPLIT_LABELS[day.splitType]);
    return `${weekday} · ${split}`;
  });

  protected nameOf(exercise: WorkoutDayExerciseDraft): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? exercise.nameRu : locale === 'uz' ? exercise.nameUz : exercise.name;
  }

  protected numberChanged(value: number | null, exercise: WorkoutDayExerciseDraft, field: ExerciseNumberField): void {
    const dayKey = this.day().key;
    if (field === 'targetWeightKg') {
      this.store.updateExercise(dayKey, exercise.key, { targetWeightKg: value });
    } else if (value !== null) {
      this.store.updateExercise(dayKey, exercise.key, { [field]: value });
    }
  }

  protected repsChanged(event: Event, exercise: WorkoutDayExerciseDraft): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.store.updateExercise(this.day().key, exercise.key, { targetReps: input.value });
    }
  }

  protected removeExercise(exercise: WorkoutDayExerciseDraft): void {
    this.store.removeExercise(this.day().key, exercise.key);
  }
}
