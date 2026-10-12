import { Component, computed, inject, signal } from '@angular/core';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachNutritionReportStore } from '../../coach-nutrition-report.store';
import { CoachFoodDiaryStore } from '../../coach-food-diary.store';
import { CoachFoodDiary } from '../coach-food-diary/coach-food-diary';
import { intakeOf, nutritionSummary } from '../../models/coach-nutrition-intake';
import { CoachPeriodControl } from '../coach-period-control/coach-period-control';
import { Translate, dayMonthLabel, rangeLabel, weekdayLabel } from '../../models/coach-report-dates';
import { CoachReportState } from '../coach-report-state/coach-report-state';

const MAX_NUTRITION_DAYS = 92;

@Component({
  selector: 'coach-nutrition-report',
  imports: [CoachFoodDiary, CoachPeriodControl, CoachReportState, TranslatePipe],
  templateUrl: './coach-nutrition-report.html',
  styleUrls: ['../coach-report.css', './coach-nutrition-report.css'],
})
export class CoachNutritionReport {
  private readonly locale = inject(LocaleStore);
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);

  protected readonly nutritionReport = inject(CoachNutritionReportStore);
  protected readonly diary = inject(CoachFoodDiaryStore);
  protected readonly maxDays = MAX_NUTRITION_DAYS;
  protected readonly diaryOpen = signal(false);
  protected readonly period = computed(() =>
    rangeLabel(this.nutritionReport.nutritionFrom(), this.nutritionReport.nutritionTo(), this.translate),
  );
  protected readonly summary = computed(() => nutritionSummary(this.nutritionReport.nutrition()));
  protected readonly days = computed(() =>
    [...this.nutritionReport.nutrition()]
      .sort((left, right) => right.date.localeCompare(left.date))
      .map((day) => ({ day, intake: intakeOf(day.consumedCalories, day.targetCalories) })),
  );
  protected readonly selectedDay = computed(
    () => this.nutritionReport.nutrition().find((day) => day.date.slice(0, 10) === this.diary.foodLogDate()) ?? null,
  );

  protected openDay(date: string): void {
    this.diaryOpen.set(true);
    void this.diary.selectDiaryDay(date.slice(0, 10));
  }

  protected isSelected(date: string): boolean {
    return date.slice(0, 10) === this.diary.foodLogDate();
  }

  protected dayLabel(isoDate: string): string {
    return dayMonthLabel(isoDate, this.translate);
  }

  protected weekday(isoDate: string): string {
    return weekdayLabel(isoDate, this.translate);
  }

  protected amount(value: number): string {
    return value.toLocaleString(INTL_LOCALES[this.locale.locale()]);
  }
}
