import { Component, computed, inject, signal } from '@angular/core';
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
import { Translator } from '@core/i18n/translator';
import { LocaleStore } from '@core/i18n/locale.store';
import { localizedNameField, pickLocalized } from '@shared/models/localized-text';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-exercises-page',
  imports: [DataTable, ExerciseFilters, ExerciseFormDialog, Button, Tag, TranslatePipe],
  providers: [ExercisesStore],
  templateUrl: './exercises-page.html',
})
export class ExercisesPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(ExercisesStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    {
      field: localizedNameField(this.localeStore.locale()),
      header: this.translator.translate('exercises.page.columns.name'),
      sortable: true,
    },
    {
      field: 'muscleGroup',
      header: this.translator.translate('exercises.page.columns.muscleGroup'),
      sortable: true,
    },
    {
      field: 'equipmentType',
      header: this.translator.translate('exercises.page.columns.equipment'),
    },
    { field: 'difficulty', header: this.translator.translate('exercises.page.columns.difficulty') },
    {
      field: 'isActive',
      header: this.translator.translate('exercises.page.columns.activity'),
      width: '9rem',
    },
    { field: 'actions', header: '', width: '11rem' },
  ]);

  protected readonly dialogVisible = signal(false);
  protected readonly editedExercise = signal<Exercise | null>(null);

  protected muscleGroupLabel(exercise: Exercise): string {
    return this.translator.translate(MUSCLE_GROUP_LABELS[exercise.muscleGroup]);
  }

  protected equipmentTypeLabel(exercise: Exercise): string {
    return this.translator.translate(EQUIPMENT_TYPE_LABELS[exercise.equipmentType]);
  }

  protected difficultyLabel(exercise: Exercise): string {
    return this.translator.translate(DIFFICULTY_LABELS[exercise.difficulty]);
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

  protected localizedName(exercise: Exercise): string {
    return pickLocalized(exercise.names, this.localeStore.locale());
  }

  protected async remove(exercise: Exercise): Promise<void> {
    if (await this.confirmations.confirmDelete(this.localizedName(exercise))) {
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
