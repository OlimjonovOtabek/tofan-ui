import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Progress } from '@coach/core/ui/progress/progress';
import { SectionCard } from '@coach/core/ui/section-card/section-card';
import { ProgramUsage } from '../../models/dashboard';

@Component({
  selector: 'coach-programs-card',
  imports: [TranslatePipe, Progress, SectionCard],
  template: `
    @let usage = programs();
    <coach-section-card
      [title]="'coachApp.dashboard.programs.title' | t"
      [actionLabel]="'coachApp.common.seeAll' | t"
      (action)="seeAll.emit()"
    >
      <div class="usage">
        <p class="row t-base3">
          <span class="font-medium">{{ 'coachApp.dashboard.programs.workout' | t }}</span>
          <span class="font-semibold">{{ usage.workoutUsers }} · {{ usage.workoutPercent }}%</span>
        </p>
        <coach-progress [value]="usage.workoutPercent / 100" />
      </div>
      <div class="usage">
        <p class="row t-base3">
          <span class="font-medium">{{ 'coachApp.dashboard.programs.meal' | t }}</span>
          <span class="font-semibold">{{ usage.mealUsers }} · {{ usage.mealPercent }}%</span>
        </p>
        <coach-progress [value]="usage.mealPercent / 100" />
      </div>
      <p class="t-base5 tone-secondary">{{ 'coachApp.dashboard.programs.ofActive' | t }}</p>
    </coach-section-card>
  `,
  styles: `
    .usage {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
  `,
})
export class ProgramsCard {
  readonly programs = input.required<ProgramUsage>();
  readonly seeAll = output<void>();
}
