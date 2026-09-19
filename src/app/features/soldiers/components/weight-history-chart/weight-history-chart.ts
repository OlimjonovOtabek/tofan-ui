import { Component, computed, inject, input } from '@angular/core';
import { formatDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ChartArea, ChartPoint, toWeightChart } from '../../models/weight-chart';
import { WeightEntry } from '../../models/weight-entry';
import { WEIGHT_SOURCE_LABELS } from '../../models/soldier-labels';

const AREA: ChartArea = { width: 640, height: 220, left: 44, right: 16, top: 16, bottom: 28 };

@Component({
  selector: 'app-weight-history-chart',
  imports: [TranslatePipe],
  templateUrl: './weight-history-chart.html',
})
export class WeightHistoryChart {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly entries = input.required<readonly WeightEntry[]>();
  readonly targetKg = input<number | null>(null);

  protected readonly area = AREA;
  protected readonly chart = computed(() => toWeightChart(this.entries(), this.targetKg(), AREA));
  protected readonly firstDate = computed(() => this.dayLabel(this.entries().at(0)?.loggedAt));
  protected readonly lastDate = computed(() => this.dayLabel(this.entries().at(-1)?.loggedAt));

  protected pointTitle(point: ChartPoint): string {
    return this.translator.translate('soldiers.chart.point', {
      date: this.dayLabel(point.entry.loggedAt),
      value: point.entry.weightKg,
      source: this.translator.translate(WEIGHT_SOURCE_LABELS[point.entry.source]),
    });
  }

  private dayLabel(date: Date | undefined): string {
    return date === undefined ? '' : formatDate(date, this.localeStore.locale());
  }
}
