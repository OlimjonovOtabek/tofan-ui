import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { MEAL_TYPE_LABELS } from '@coach/core/fitness/meal-type';
import { SERVING_UNIT_LABELS } from '@coach/core/fitness/serving-unit';
import { formatCount, formatMoneyShort } from '@coach/core/format/formats';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { MetricTile } from '@coach/core/ui/metric-tile/metric-tile';
import { SectionHeader } from '@coach/core/ui/section-header/section-header';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { pickLocalized } from '@shared/models/localized-text';
import { PublishActions } from '../../components/publish-actions/publish-actions';
import { ProgramSummary } from '../../components/program-summary/program-summary';
import { MealProgramStore } from '../../meal-program.store';
import { formatQuantity } from '../../models/food';
import {
  Meal,
  MealItem,
  hasSeveralOptions,
  mealClock,
  mealOptions,
} from '../../models/meal-program';
import { goalText, mealProgramTitle } from '../../models/program-text';

@Component({
  selector: 'coach-meal-program-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    EmptyState,
    MetricTile,
    PublishActions,
    ProgramSummary,
    SectionHeader,
    Shimmer,
  ],
  providers: [MealProgramStore],
  templateUrl: './meal-program-page.html',
  styleUrl: './meal-program-page.css',
})
export class MealProgramPage {
  protected readonly store = inject(MealProgramStore);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly id = input.required<string>();

  private readonly t = this.translator.translate.bind(this.translator);
  protected readonly title = computed(() => {
    const program = this.store.program();
    return program === null ? '' : mealProgramTitle(program, this.t);
  });
  protected readonly meta = computed(() => {
    const program = this.store.program();
    if (program === null) {
      return '';
    }
    const goal = program.name === '' ? null : goalText(program, this.t);
    return [goal, this.t('coachApp.meal.programMealCount', { count: program.meals.length })]
      .filter((part) => part !== null)
      .join(' · ');
  });
  protected readonly several = computed(() => hasSeveralOptions(this.store.program()?.meals ?? []));

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.store.load(id));
    });
  }

  protected edit(): void {
    void this.router.navigate(['/programs/meal', this.id(), 'edit']);
  }

  protected count(value: number): string {
    return formatCount(value, this.locale());
  }

  protected cost(value: number): string {
    return this.t('coachApp.meal.programCost', { cost: formatMoneyShort(value, this.locale()) });
  }

  protected mealTitle(meal: Meal): string {
    const type = this.t(MEAL_TYPE_LABELS[meal.type]);
    return meal.title === '' ? type : meal.title;
  }

  protected mealSubtitle(meal: Meal): string {
    const type = this.t(MEAL_TYPE_LABELS[meal.type]);
    return [meal.title !== '' && meal.title !== type ? type : null, mealClock(meal.plannedTime)]
      .filter((part) => part !== null)
      .join(' · ');
  }

  protected options(meal: Meal) {
    return mealOptions(meal, this.store.program()?.optionTotals ?? []);
  }

  protected itemName(item: MealItem): string {
    return pickLocalized(item.name, this.locale());
  }

  protected itemPortion(item: MealItem): string {
    const portion = `${formatQuantity(item.quantity)} ${this.t(SERVING_UNIT_LABELS[item.unit])}`;
    return item.calories > 0
      ? this.t('coachApp.meal.itemPortionKcal', { portion, kcal: item.calories })
      : portion;
  }

  protected async togglePublished(published: boolean): Promise<void> {
    const confirmed = await this.sheets.confirm({
      title: this.t(
        published
          ? 'coachApp.workoutProgram.unpublishConfirmTitle'
          : 'coachApp.programs.publishConfirmTitle',
      ),
      message: published
        ? this.t('coachApp.workoutProgram.lastPublishedWarning')
        : this.t('coachApp.programs.publishConfirmMessage', { name: this.title() }),
      confirmLabel: this.t(
        published ? 'coachApp.workoutProgram.unpublish' : 'coachApp.programs.publish',
      ),
      cancelLabel: this.t('coachApp.common.cancel'),
    });
    if (confirmed) {
      await this.store.togglePublished();
    }
  }

  protected async delete(): Promise<void> {
    const confirmed = await this.sheets.confirm({
      title: this.t('coachApp.workoutProgram.deleteConfirmTitle'),
      message: this.t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: this.t('coachApp.workoutProgram.delete'),
      cancelLabel: this.t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed && (await this.store.delete())) {
      await this.router.navigate(['/programs'], { queryParams: { kind: 'meal' } });
    }
  }
}
