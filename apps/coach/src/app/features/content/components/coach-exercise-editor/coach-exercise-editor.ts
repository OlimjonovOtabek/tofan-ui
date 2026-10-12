import { Button } from '@openng/optimus-ui/button';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { Tag } from '@openng/optimus-ui/tag';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { TextareaField } from '@shared/components/textarea-field/textarea-field';
import { TextField } from '@shared/components/text-field/text-field';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, pattern, required, schema } from '@angular/forms/signals';
import { SelectField } from '@shared/components/select-field/select-field';
import { Translator } from '@core/i18n/translator';
import { inject } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from '@shared/models/exercise-attribute-labels';
import { CoachExercise, CoachExerciseDraft } from '../../models/coach-exercise';
import {
  ExerciseFormValue,
  UNSPECIFIED_EQUIPMENT,
  UNSPECIFIED_MUSCLE_GROUP,
  emptyExerciseForm,
  exerciseFormOf,
  toExerciseDraft,
} from '../../models/coach-exercise-form';

const NON_BLANK = /\S/;
const exerciseSchema = schema<ExerciseFormValue>((path) => {
  required(path.name, { message: 'coach.content.exerciseNameRequired' });
  pattern(path.name, NON_BLANK, { message: 'coach.content.exerciseNameRequired' });
  required(path.nameRu, { message: 'coach.content.exerciseNameRequired' });
  pattern(path.nameRu, NON_BLANK, { message: 'coach.content.exerciseNameRequired' });
  required(path.nameUz, { message: 'coach.content.exerciseNameRequired' });
  pattern(path.nameUz, NON_BLANK, { message: 'coach.content.exerciseNameRequired' });
  required(path.muscleGroup);
  required(path.equipmentType);
  required(path.difficulty);
  required(path.type);
  required(path.gender);
});

@Component({
  selector: 'coach-exercise-editor',
  imports: [
    Button,
    ToggleField,
    Tag,
    ProgressBar,
    TextareaField,
    TextField,
    ButtonDirective,
    FormField,
    SelectField,
    TranslatePipe,
  ],
  templateUrl: './coach-exercise-editor.html',
  styleUrl: './coach-exercise-editor.css',
})
export class CoachExerciseEditor {
  private readonly translator = inject(Translator);

  readonly exercise = input<CoachExercise | null>(null);
  readonly videoFileId = input<string | null>(null);
  readonly saving = input(false);
  readonly uploadProgress = input<number | null>(null);
  readonly uploadFailed = input(false);
  readonly exerciseSubmitted = output<CoachExerciseDraft>();
  readonly uploadVideo = output<File>();
  readonly uploadCancelled = output<void>();
  readonly editingCancelled = output<void>();

  protected readonly value = signal<ExerciseFormValue>(emptyExerciseForm(null));
  protected readonly exerciseForm = form(this.value, exerciseSchema);
  protected readonly muscleOptions = computed(() =>
    this.translator.options(
      MUSCLE_GROUP_OPTIONS.filter((option) => option.value !== UNSPECIFIED_MUSCLE_GROUP),
    ),
  );
  protected readonly equipmentOptions = computed(() =>
    this.translator.options(
      EQUIPMENT_TYPE_OPTIONS.filter((option) => option.value !== UNSPECIFIED_EQUIPMENT),
    ),
  );
  protected readonly difficultyOptions = computed(() =>
    this.translator.options(DIFFICULTY_OPTIONS),
  );
  protected readonly typeOptions = computed(() => this.translator.options(EXERCISE_TYPE_OPTIONS));
  protected readonly genderOptions = computed(() => this.translator.options(GENDER_OPTIONS));

  constructor() {
    effect(() => {
      const exercise = this.exercise();
      const videoFileId = untracked(() => this.videoFileId());
      untracked(() =>
        this.exerciseForm().reset(
          exercise === null ? emptyExerciseForm(videoFileId) : exerciseFormOf(exercise, videoFileId),
        ),
      );
    });
    effect(() => {
      const videoFileId = this.videoFileId();
      untracked(() => this.value.update((value) => ({ ...value, videoFileId })));
    });
  }

  protected selectVideo(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files?.[0];
    if (file !== undefined) {
      this.uploadVideo.emit(file);
    }
    input.value = '';
  }

  protected submit(): void {
    this.exerciseForm().markAsTouched();
    const draft = toExerciseDraft(this.value());
    if (this.exerciseForm().invalid() || draft === null) {
      return;
    }
    this.exerciseSubmitted.emit(draft);
  }

  protected cancelUpload(): void {
    this.uploadCancelled.emit();
  }
}
