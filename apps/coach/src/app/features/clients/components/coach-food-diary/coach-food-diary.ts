import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { TranslationKey } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachFoodLog } from '../../models/coach-client';
import { CoachDailyNutrition } from '../../services/coach-client-detail.dto';
import { CoachFoodDiaryStore } from '../../coach-food-diary.store';
import { MEAL_TYPES, MEAL_TYPE_LABELS, MealType } from '@coach/core/fitness/meal-type';
import { Intake, intakeOf } from '../../models/coach-nutrition-intake';
import { Translate, dayMonthLabel, weekdayLabel } from '../../models/coach-report-dates';
import { CoachReportState } from '../coach-report-state/coach-report-state';

interface MacroLine {
  label: TranslationKey;
  tone: 'protein' | 'carbs' | 'fat';
  consumed: number;
  target: number;
  intake: Intake;
}

interface DiaryGroup {
  mealType: MealType;
  label: TranslationKey;
  calories: number;
  logs: readonly CoachFoodLog[];
}

@Component({
  selector: 'coach-food-diary',
  imports: [ButtonDirective, CoachReportState, TranslatePipe],
  templateUrl: './coach-food-diary.html',
  styleUrls: ['../coach-report.css', './coach-food-diary.css'],
})
export class CoachFoodDiary {
  private readonly locale = inject(LocaleStore);
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);

  protected readonly diary = inject(CoachFoodDiaryStore);

  readonly day = input<CoachDailyNutrition | null>(null);
  readonly backRequested = output<void>();

  protected readonly dateLabel = computed(() => dayMonthLabel(this.diary.foodLogDate(), this.translate));
  protected readonly weekday = computed(() => weekdayLabel(this.diary.foodLogDate(), this.translate));
  protected readonly calories = computed(() => {
    const day = this.day();
    return day === null ? null : intakeOf(day.consumedCalories, day.targetCalories);
  });
  protected readonly macros = computed<readonly MacroLine[]>(() => {
    const day = this.day();
    if (day === null) {
      return [];
    }
    return [
      this.macro('coach.clients.protein', 'protein', day.proteinGrams, day.targetProteinGrams),
      this.macro('coach.clients.carbs', 'carbs', day.carbsGrams, day.targetCarbsGrams),
      this.macro('coach.clients.fat', 'fat', day.fatGrams, day.targetFatGrams),
    ];
  });
  protected readonly groups = computed<readonly DiaryGroup[]>(() => {
    const logs = this.diary.foodLogs();
    return MEAL_TYPES.map((mealType) => ({
      mealType,
      logs: logs.filter((log) => log.mealType === mealType),
    }))
      .filter((group) => group.logs.length > 0)
      .map((group) => ({
        ...group,
        label: MEAL_TYPE_LABELS[group.mealType],
        calories: group.logs.reduce((sum, log) => sum + log.calories, 0),
      }));
  });

  protected foodName(log: CoachFoodLog): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? log.foodNameRu : locale === 'uz' ? log.foodNameUz : log.foodName;
  }

  protected amount(value: number): string {
    return value.toLocaleString(INTL_LOCALES[this.locale.locale()]);
  }

  private macro(label: TranslationKey, tone: MacroLine['tone'], consumed: number, target: number): MacroLine {
    return { label, tone, consumed, target, intake: intakeOf(consumed, target) };
  }
}
