import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Exercise } from '../../models/exercise';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '../../models/exercise-attributes';
import { ExerciseDraft } from '../../models/exercise-draft';
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from '../../models/exercise-labels';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import {
  LocalizedTextField,
  createLocalizedTextGroup,
} from '@shared/components/localized-text-field/localized-text-field';
import { Select } from '@openng/optimus-ui/select';
import { Textarea } from '@openng/optimus-ui/textarea';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';

@Component({
  selector: 'app-exercise-form-dialog',
  imports: [
    ReactiveFormsModule,
    FormDialog,
    LocalizedTextField,
    FileUpload,
    Select,
    Textarea,
    ToggleSwitch,
  ],
  templateUrl: './exercise-form-dialog.html',
})
export class ExerciseFormDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly visible = model.required<boolean>();
  readonly exercise = input<Exercise | null>(null);
  readonly saving = input(false);

  readonly save = output<ExerciseDraft>();

  protected readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;
  protected readonly equipmentTypeOptions = EQUIPMENT_TYPE_OPTIONS;
  protected readonly difficultyOptions = DIFFICULTY_OPTIONS;
  protected readonly typeOptions = EXERCISE_TYPE_OPTIONS;
  protected readonly genderOptions = GENDER_OPTIONS;

  protected readonly names = createLocalizedTextGroup(this.formBuilder);
  protected readonly form = this.formBuilder.group({
    names: this.names,
    muscleGroup: this.formBuilder.control<MuscleGroup>('chest', Validators.required),
    equipmentType: this.formBuilder.control<EquipmentType>('bodyweight', Validators.required),
    difficulty: this.formBuilder.control<ExerciseDifficulty>('beginner', Validators.required),
    type: this.formBuilder.control<ExerciseType>('strength', Validators.required),
    gender: this.formBuilder.control<ExerciseGender>('any', Validators.required),
    isCompound: this.formBuilder.control(false),
    isHomeExercise: this.formBuilder.control(false),
    instructions: this.formBuilder.control(''),
  });
  protected readonly videoFileId = signal<string | null>(null);
  protected readonly videoFileName = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.reset(this.exercise()));
      }
    });
  }

  protected title(): string {
    return this.exercise() === null ? "Mashq qo'shish" : 'Mashqni tahrirlash';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      name: value.names.name,
      nameUz: value.names.nameUz,
      nameRu: value.names.nameRu,
      muscleGroup: value.muscleGroup,
      equipmentType: value.equipmentType,
      difficulty: value.difficulty,
      type: value.type,
      gender: value.gender,
      isCompound: value.isCompound,
      isHomeExercise: value.isHomeExercise,
      instructions: value.instructions,
      videoFileId: this.videoFileId(),
    });
  }

  private reset(exercise: Exercise | null): void {
    this.form.reset({
      names: {
        name: exercise?.name ?? '',
        nameUz: exercise?.nameUz ?? '',
        nameRu: exercise?.nameRu ?? '',
      },
      muscleGroup: exercise?.muscleGroup ?? 'chest',
      equipmentType: exercise?.equipmentType ?? 'bodyweight',
      difficulty: exercise?.difficulty ?? 'beginner',
      type: exercise?.type ?? 'strength',
      gender: exercise?.gender ?? 'any',
      isCompound: exercise?.isCompound ?? false,
      isHomeExercise: exercise?.isHomeExercise ?? false,
      instructions: exercise?.instructions ?? '',
    });
    this.videoFileId.set(exercise?.videoFileId ?? null);
    this.videoFileName.set(exercise?.hasVideo() === true ? 'Yuklangan video' : null);
  }
}
