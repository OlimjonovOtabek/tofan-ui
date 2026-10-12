import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { formatCalendarDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachProgramsStore } from '../../coach-programs.store';
import { FITNESS_GOAL_LABELS, FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { EXPERIENCE_LEVEL_LABELS, ExperienceLevel } from '../../models/coach-program-attributes';
import { mealRangeLabel } from '../../models/coach-program-labels';
import { MealProgramSummary } from '../../services/coach-program.dto';

@Component({
  selector: 'coach-published-programs',
  imports: [Button, RouterLink, Skeleton, TranslatePipe],
  templateUrl: './coach-published-programs.html',
  styleUrl: './coach-published-programs.css',
})
export class CoachPublishedPrograms {
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore);

  protected readonly store = inject(CoachProgramsStore);

  readonly workoutRequested = output<void>();
  readonly mealRequested = output<void>();

  protected goalLabel(goal: FitnessGoal): string {
    return this.translator.translate(FITNESS_GOAL_LABELS[goal]);
  }

  protected levelLabel(level: ExperienceLevel): string {
    return this.translator.translate(EXPERIENCE_LEVEL_LABELS[level]);
  }

  protected mealRange(program: MealProgramSummary): string {
    return mealRangeLabel(program, (date) => formatCalendarDate(date, this.locale.locale()));
  }
}
