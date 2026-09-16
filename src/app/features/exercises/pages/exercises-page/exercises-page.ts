import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../models/exercise';
import { ExerciseDraft } from '../../models/exercise-draft';
import { ExerciseFilter } from '../../models/exercise-filter';
import { PageRequest } from '@shared/models/page';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUP_OPTIONS,
} from '../../models/exercise-labels';
import { ExercisesStore } from '../../exercises.store';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { Tag } from '@openng/optimus-ui/tag';
import { debounceTime } from 'rxjs';
import { ExerciseFormDialog } from '../../components/exercise-form-dialog/exercise-form-dialog';

const SEARCH_DEBOUNCE_MS = 400;

const ACTIVITY_OPTIONS = [
  { value: true, label: 'Faol' },
  { value: false, label: 'Faol emas' },
];

const PLACE_OPTIONS = [
  { value: true, label: 'Uyda' },
  { value: false, label: 'Zalda' },
];

@Component({
  selector: 'app-exercises-page',
  imports: [ReactiveFormsModule, DataTable, ExerciseFormDialog, Button, InputText, Select, Tag],
  providers: [ExercisesStore],
  templateUrl: './exercises-page.html',
})
export class ExercisesPage {
  private readonly confirmations = inject(ConfirmDialogService);

  protected readonly store = inject(ExercisesStore);

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'nameUz', header: 'Nomi', sortable: true },
    { field: 'muscleGroup', header: 'Mushak guruhi', sortable: true },
    { field: 'equipmentType', header: 'Jihoz' },
    { field: 'difficulty', header: 'Qiyinlik' },
    { field: 'isActive', header: 'Holati', width: '9rem' },
    { field: 'actions', header: '', width: '11rem' },
  ];

  protected readonly muscleGroupOptions = MUSCLE_GROUP_OPTIONS;
  protected readonly equipmentTypeOptions = EQUIPMENT_TYPE_OPTIONS;
  protected readonly genderOptions = GENDER_OPTIONS;
  protected readonly activityOptions = ACTIVITY_OPTIONS;
  protected readonly placeOptions = PLACE_OPTIONS;

  protected readonly filterForm = inject(NonNullableFormBuilder).group({
    search: [''],
    muscleGroup: [null as ExerciseFilter['muscleGroup'] | null],
    equipmentType: [null as ExerciseFilter['equipmentType'] | null],
    gender: [null as ExerciseFilter['gender'] | null],
    isHomeExercise: [null as boolean | null],
    isActive: [null as boolean | null],
  });

  protected readonly dialogVisible = signal(false);
  protected readonly editedExercise = signal<Exercise | null>(null);

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => void this.applyFilter());
  }

  protected muscleGroupLabel(exercise: Exercise): string {
    return MUSCLE_GROUP_LABELS[exercise.muscleGroup];
  }

  protected equipmentTypeLabel(exercise: Exercise): string {
    return EQUIPMENT_TYPE_LABELS[exercise.equipmentType];
  }

  protected difficultyLabel(exercise: Exercise): string {
    return DIFFICULTY_LABELS[exercise.difficulty];
  }

  protected add(): void {
    this.editedExercise.set(null);
    this.dialogVisible.set(true);
  }

  protected edit(exercise: Exercise): void {
    this.editedExercise.set(exercise);
    this.dialogVisible.set(true);
  }

  protected async saveDraft(draft: ExerciseDraft): Promise<void> {
    const saved = await this.store.save(draft, this.editedExercise()?.id ?? null);
    if (saved) {
      this.dialogVisible.set(false);
    }
  }

  protected async remove(exercise: Exercise): Promise<void> {
    if (await this.confirmations.confirmDelete(exercise.displayName)) {
      await this.store.remove(exercise);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected resetFilters(): void {
    this.filterForm.reset();
  }

  private applyFilter(): Promise<void> {
    const value = this.filterForm.getRawValue();
    return this.store.applyFilter({
      ...(value.search.trim().length === 0 ? {} : { search: value.search.trim() }),
      ...(value.muscleGroup === null ? {} : { muscleGroup: value.muscleGroup }),
      ...(value.equipmentType === null ? {} : { equipmentType: value.equipmentType }),
      ...(value.gender === null ? {} : { gender: value.gender }),
      ...(value.isHomeExercise === null ? {} : { isHomeExercise: value.isHomeExercise }),
      ...(value.isActive === null ? {} : { isActive: value.isActive }),
    });
  }
}
