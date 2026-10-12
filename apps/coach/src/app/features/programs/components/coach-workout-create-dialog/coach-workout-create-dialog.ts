import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, pattern, required, schema } from '@angular/forms/signals';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectField } from '@shared/components/select-field/select-field';
import { TextField } from '@shared/components/text-field/text-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { FITNESS_GOAL_OPTIONS, FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { NewWorkoutProgram } from '../../models/coach-program';
import { EXPERIENCE_LEVEL_OPTIONS, ExperienceLevel } from '../../models/coach-program-attributes';

interface WorkoutDraftValue {
  name: string;
  goal: FitnessGoal | null;
  experienceLevel: ExperienceLevel | null;
  isHomeWorkout: boolean;
}

const NON_BLANK = /\S/;
const workoutSchema = schema<WorkoutDraftValue>((path) => {
  required(path.name, { message: 'coach.programs.nameRequired' });
  pattern(path.name, NON_BLANK, { message: 'coach.programs.nameRequired' });
  required(path.goal, { message: 'coach.programs.goalRequired' });
  required(path.experienceLevel, { message: 'coach.programs.experienceRequired' });
});

@Component({
  selector: 'coach-workout-create-dialog',
  imports: [ButtonDirective, Dialog, FormField, SelectField, TextField, ToggleField, TranslatePipe],
  templateUrl: './coach-workout-create-dialog.html',
  styleUrl: './coach-workout-create-dialog.css',
})
export class CoachWorkoutCreateDialog {
  private readonly translator = inject(Translator);

  protected readonly value = signal<WorkoutDraftValue>({
    name: '',
    goal: null,
    experienceLevel: null,
    isHomeWorkout: false,
  });
  protected readonly workoutForm = form(this.value, workoutSchema);
  protected readonly goalOptions = computed(() => this.translator.options(FITNESS_GOAL_OPTIONS));
  protected readonly experienceOptions = computed(() =>
    this.translator.options(EXPERIENCE_LEVEL_OPTIONS),
  );

  readonly saving = input(false);
  readonly created = output<NewWorkoutProgram>();
  readonly closed = output<void>();

  protected submit(): void {
    this.workoutForm().markAsTouched();
    const value = this.value();
    if (this.workoutForm().invalid() || value.goal === null || value.experienceLevel === null) {
      return;
    }
    this.created.emit({
      name: value.name,
      goal: value.goal,
      experienceLevel: value.experienceLevel,
      isHomeWorkout: value.isHomeWorkout,
    });
  }
}
