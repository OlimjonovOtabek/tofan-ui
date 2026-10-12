import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { formatDate } from '@core/i18n/date-format';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { SoldierFilters } from '../../components/soldier-filters/soldier-filters';
import { SoldierFilter } from '../../models/soldier-filter';
import { MISSING_VALUE } from '../../models/soldier-facts';
import {
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
  workoutPlaceLabel,
} from '../../models/soldier-labels';
import { SoldierSummary } from '../../models/soldier-summary';
import { SoldiersStore } from '../../soldiers.store';

@Component({
  selector: 'app-soldiers-page',
  imports: [DataTable, SoldierFilters, RouterLink, TranslatePipe],
  providers: [SoldiersStore],
  templateUrl: './soldiers-page.html',
})
export class SoldiersPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(SoldiersStore);

  protected readonly soldiersPath = AppPaths.soldiers;

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'firstName', header: this.text('soldiers.list.columns.soldier'), sortable: true },
    { field: 'gender', header: this.text('soldiers.list.columns.gender'), width: '7rem' },
    { field: 'goal', header: this.text('soldiers.list.columns.goal') },
    {
      field: 'experienceLevel',
      header: this.text('soldiers.list.columns.experience'),
      width: '9rem',
    },
    {
      field: 'currentWeightKg',
      header: this.text('soldiers.list.columns.weight'),
      sortable: true,
      width: '11rem',
    },
    { field: 'isHomeWorkout', header: this.text('soldiers.list.columns.place'), width: '6rem' },
    {
      field: 'createdOnUtc',
      header: this.text('soldiers.list.columns.joined'),
      sortable: true,
      width: '10rem',
    },
  ]);

  protected genderLabel(soldier: SoldierSummary): string {
    return soldier.gender === null ? MISSING_VALUE : this.text(GENDER_LABELS[soldier.gender]);
  }

  protected goalLabel(soldier: SoldierSummary): string {
    return soldier.goal === null ? MISSING_VALUE : this.text(FITNESS_GOAL_LABELS[soldier.goal]);
  }

  protected experienceLabel(soldier: SoldierSummary): string {
    return soldier.experienceLevel === null
      ? MISSING_VALUE
      : this.text(EXPERIENCE_LEVEL_LABELS[soldier.experienceLevel]);
  }

  protected weightLabel(soldier: SoldierSummary): string {
    if (soldier.currentWeightKg === null && soldier.targetWeightKg === null) {
      return MISSING_VALUE;
    }
    return this.text('soldiers.list.weight', {
      current: soldier.currentWeightKg ?? MISSING_VALUE,
      target: soldier.targetWeightKg ?? MISSING_VALUE,
    });
  }

  protected placeLabel(soldier: SoldierSummary): string {
    return soldier.isHomeWorkout === null
      ? MISSING_VALUE
      : this.text(workoutPlaceLabel(soldier.isHomeWorkout));
  }

  protected joinedLabel(soldier: SoldierSummary): string {
    return formatDate(soldier.joinedAt, this.localeStore.locale());
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: SoldierFilter): void {
    void this.store.applyFilter(filter);
  }

  private text(key: TranslationKey, params?: Record<string, string | number>): string {
    return this.translator.translate(key, params);
  }
}
