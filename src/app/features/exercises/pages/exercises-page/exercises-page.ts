import { Component, inject, signal } from '@angular/core';
import { Exercise } from '../../models/exercise';
import { ExerciseDraft } from '../../models/exercise-draft';
import { ExerciseFilter } from '../../models/exercise-filter';
import { PageRequest } from '@shared/models/page';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_TYPE_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../../models/exercise-labels';
import { ExercisesStore } from '../../exercises.store';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { ExerciseFilters } from '../../components/exercise-filters/exercise-filters';
import { ExerciseFormDialog } from '../../components/exercise-form-dialog/exercise-form-dialog';

@Component({
  selector: 'app-exercises-page',
  imports: [DataTable, ExerciseFilters, ExerciseFormDialog, Button, Tag],
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

  protected readonly dialogVisible = signal(false);
  protected readonly editedExercise = signal<Exercise | null>(null);

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

  protected applyFilter(filter: ExerciseFilter): void {
    void this.store.applyFilter(filter);
  }
}
