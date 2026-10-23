import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { MoneyPipe } from '@coach/core/format/format.pipes';
import { Note } from '@coach/core/ui/note/note';
import { Segment, Segmented } from '@coach/core/ui/segmented/segmented';
import { DashboardEarnings } from '../../models/dashboard';
import {
  DASHBOARD_PERIODS,
  DASHBOARD_PERIOD_LABELS,
  DashboardPeriod,
} from '../../models/dashboard-period';

@Component({
  selector: 'coach-earnings-card',
  imports: [TranslatePipe, MoneyPipe, Note, Segmented],
  templateUrl: './earnings-card.html',
  styleUrl: './earnings-card.css',
})
export class EarningsCard {
  private readonly translator = inject(Translator);

  readonly earnings = input.required<DashboardEarnings | null>();
  readonly open = output<void>();

  protected readonly period = signal<DashboardPeriod>('week');
  protected readonly segments = computed<Segment<DashboardPeriod>[]>(() =>
    DASHBOARD_PERIODS.map((value) => ({
      value,
      label: this.translator.translate(DASHBOARD_PERIOD_LABELS[value]),
    })),
  );
  protected readonly total = computed(() => this.earnings()?.totals[this.period()] ?? null);
  protected readonly heading = computed(() =>
    this.translator.translate('coachApp.dashboard.earnings.period', {
      period: this.translator.translate(DASHBOARD_PERIOD_LABELS[this.period()]).toLowerCase(),
    }),
  );
  protected readonly meta = computed(() =>
    [
      this.translator.translate('coachApp.dashboard.earnings.net'),
      this.translator.translate('coachApp.dashboard.earnings.payments', {
        count: this.total()?.paymentCount ?? 0,
      }),
      this.translator.translate('coachApp.dashboard.earnings.renewed', {
        count: this.earnings()?.renewedThisMonth ?? 0,
      }),
    ].join(' · '),
  );
}
