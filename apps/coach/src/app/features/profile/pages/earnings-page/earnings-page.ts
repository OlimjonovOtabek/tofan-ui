import { Component, computed, inject } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { formatMoney } from '@coach/core/format/formats';
import { PaymentRow } from '@coach/core/payments/payment-row';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Segment, Segmented } from '@coach/core/ui/segmented/segmented';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { EarningsStore } from '../../earnings.store';
import { EARNINGS_PERIODS, EarningsPeriod } from '../../models/earnings';

const PERIOD_LABELS = {
  thisMonth: 'coachApp.earnings.periodThisMonth',
  lastMonth: 'coachApp.earnings.periodLastMonth',
  thisYear: 'coachApp.earnings.periodThisYear',
} as const;

@Component({
  selector: 'coach-earnings-page',
  imports: [TranslatePipe, MessagePipe, AppBar, Button, EmptyState, PaymentRow, Segmented, Shimmer],
  providers: [EarningsStore],
  templateUrl: './earnings-page.html',
  styleUrl: './earnings-page.css',
})
export class EarningsPage {
  protected readonly store = inject(EarningsStore);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  protected readonly segments = computed<Segment<EarningsPeriod>[]>(() =>
    EARNINGS_PERIODS.map((value) => ({
      value,
      label: this.translator.translate(PERIOD_LABELS[value]),
    })),
  );
  protected readonly view = computed(() => {
    const earnings = this.store.earnings();
    if (earnings === null) {
      return null;
    }
    const { summary } = earnings;
    const t = this.translator.translate.bind(this.translator);
    return {
      net: formatMoney(summary.netAmount, summary.currencyCode, this.locale()),
      count: t('coachApp.earnings.paymentCount', { count: summary.paymentCount }),
      refunds:
        summary.refundCount > 0
          ? t('coachApp.earnings.refundsNote', {
              count: summary.refundCount,
              amount: formatMoney(summary.refundedAmount, summary.currencyCode, this.locale()),
            })
          : null,
      currency: summary.currencyCode,
      payments: earnings.payments,
    };
  });

  constructor() {
    void this.store.load('thisMonth');
  }

  protected select(period: EarningsPeriod): void {
    void this.store.load(period);
  }
}
