import { Component, computed, input } from '@angular/core';
import { ChartArea, ChartPoint, toWeightChart } from '../../models/weight-chart';
import { WeightEntry } from '../../models/weight-entry';
import { WEIGHT_SOURCE_LABELS } from '../../models/soldier-labels';

const AREA: ChartArea = { width: 640, height: 220, left: 44, right: 16, top: 16, bottom: 28 };

@Component({
  selector: 'app-weight-history-chart',
  templateUrl: './weight-history-chart.html',
})
export class WeightHistoryChart {
  readonly entries = input.required<readonly WeightEntry[]>();
  readonly targetKg = input<number | null>(null);

  protected readonly area = AREA;
  protected readonly chart = computed(() => toWeightChart(this.entries(), this.targetKg(), AREA));
  protected readonly firstDate = computed(() => dayLabel(this.entries().at(0)?.loggedAt));
  protected readonly lastDate = computed(() => dayLabel(this.entries().at(-1)?.loggedAt));

  protected pointTitle(point: ChartPoint): string {
    const source = WEIGHT_SOURCE_LABELS[point.entry.source];
    return `${dayLabel(point.entry.loggedAt)}: ${point.entry.weightKg} kg (${source})`;
  }
}

function dayLabel(date: Date | undefined): string {
  return date === undefined ? '' : date.toLocaleDateString('uz-UZ', { dateStyle: 'short' });
}
