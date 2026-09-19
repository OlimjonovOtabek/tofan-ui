import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { SoldierFilters } from '../../components/soldier-filters/soldier-filters';
import { SoldierFilter } from '../../models/soldier-filter';
import { MISSING_VALUE } from '../../models/soldier-facts';
import {
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
} from '../../models/soldier-labels';
import { SoldierSummary } from '../../models/soldier-summary';
import { SoldiersStore } from '../../soldiers.store';

@Component({
  selector: 'app-soldiers-page',
  imports: [DataTable, SoldierFilters, RouterLink],
  providers: [SoldiersStore],
  templateUrl: './soldiers-page.html',
})
export class SoldiersPage {
  protected readonly store = inject(SoldiersStore);

  protected readonly soldiersPath = AppPaths.soldiers;

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'firstName', header: 'Soldier', sortable: true },
    { field: 'gender', header: 'Jins', width: '7rem' },
    { field: 'goal', header: 'Maqsad' },
    { field: 'experienceLevel', header: 'Tajriba', width: '9rem' },
    { field: 'currentWeightKg', header: 'Vazn → maqsad', sortable: true, width: '11rem' },
    { field: 'isHomeWorkout', header: 'Joyi', width: '6rem' },
    { field: 'createdOnUtc', header: 'Qo‘shilgan', sortable: true, width: '10rem' },
  ];

  protected genderLabel(soldier: SoldierSummary): string {
    return GENDER_LABELS[soldier.gender];
  }

  protected goalLabel(soldier: SoldierSummary): string {
    return soldier.goal === null ? MISSING_VALUE : FITNESS_GOAL_LABELS[soldier.goal];
  }

  protected experienceLabel(soldier: SoldierSummary): string {
    return soldier.experienceLevel === null
      ? MISSING_VALUE
      : EXPERIENCE_LEVEL_LABELS[soldier.experienceLevel];
  }

  protected weightLabel(soldier: SoldierSummary): string {
    const current = soldier.currentWeightKg ?? MISSING_VALUE;
    const target = soldier.targetWeightKg ?? MISSING_VALUE;
    return soldier.currentWeightKg === null && soldier.targetWeightKg === null
      ? MISSING_VALUE
      : `${current} → ${target} kg`;
  }

  protected placeLabel(soldier: SoldierSummary): string {
    if (soldier.isHomeWorkout === null) {
      return MISSING_VALUE;
    }
    return soldier.isHomeWorkout ? 'Uyda' : 'Zalda';
  }

  protected joinedLabel(soldier: SoldierSummary): string {
    return soldier.joinedAt.toLocaleDateString('uz-UZ', { dateStyle: 'short' });
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: SoldierFilter): void {
    void this.store.applyFilter(filter);
  }
}
