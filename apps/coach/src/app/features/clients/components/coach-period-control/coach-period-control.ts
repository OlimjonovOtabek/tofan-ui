import { Component, computed, input, output, signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  REPORT_PERIOD_DAYS,
  ReportPeriodDays,
  ReportRange,
  addDays,
  matchingPeriod,
  periodRange,
  toIsoDate,
} from '../../models/coach-report-period';

const PERIOD_LABELS: Record<ReportPeriodDays, TranslationKey> = {
  7: 'coach.clients.period7',
  14: 'coach.clients.period14',
  30: 'coach.clients.period30',
};

@Component({
  selector: 'coach-period-control',
  imports: [TranslatePipe],
  templateUrl: './coach-period-control.html',
  styleUrl: './coach-period-control.css',
})
export class CoachPeriodControl {
  readonly from = input.required<string>();
  readonly to = input.required<string>();
  readonly maxDays = input<number | null>(null);
  readonly rangeChange = output<ReportRange>();

  protected readonly presets = REPORT_PERIOD_DAYS.map((days) => ({ days, label: PERIOD_LABELS[days] }));
  protected readonly customOpen = signal(false);
  protected readonly today = toIsoDate(new Date());
  protected readonly activePreset = computed(() =>
    this.customOpen() ? null : matchingPeriod({ from: this.from(), to: this.to() }, new Date()),
  );
  protected readonly customActive = computed(() => this.activePreset() === null);
  protected readonly earliestFrom = computed(() => {
    const maxDays = this.maxDays();
    return maxDays === null ? null : addDays(this.to(), 1 - maxDays);
  });

  protected choosePreset(days: ReportPeriodDays): void {
    this.customOpen.set(false);
    this.rangeChange.emit(periodRange(days, new Date()));
  }

  protected edgeChanged(event: Event, edge: 'from' | 'to'): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement) || input.value.length === 0) {
      return;
    }
    const range = edge === 'from' ? { from: input.value, to: this.to() } : { from: this.from(), to: input.value };
    if (range.from <= range.to) {
      this.rangeChange.emit(range);
    }
  }
}
