import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachClientDetailStore } from '../../coach-client-detail.store';
import { CoachWeightReportStore } from '../../coach-weight-report.store';
import { compactViewport } from '../../models/coach-compact-viewport';
import { CoachPeriodControl } from '../coach-period-control/coach-period-control';
import { Translate, dayMonthLabel, fullDateLabel, rangeLabel, weekdayLabel } from '../../models/coach-report-dates';
import { CoachReportState } from '../coach-report-state/coach-report-state';
import { WeightChartSize, buildWeightChart } from '../../models/coach-weight-chart';
import { recentWeightRows, sortedByLogTime, weightStats } from '../../models/coach-weight-stats';

const WIDE_CHART: WeightChartSize = { width: 900, height: 260, left: 44, right: 876, top: 14, bottom: 226 };
const COMPACT_CHART: WeightChartSize = { width: 360, height: 210, left: 30, right: 342, top: 12, bottom: 176 };
const RECENT_ROWS = 5;
const WEIGHT_DECIMALS = 1;
const LABEL_OFFSET = 26;
const AXIS_TEXT_OFFSET = 4;
const GOAL_TEXT_OFFSET = 7;

type Trend = 'good' | 'warn' | 'flat';

@Component({
  selector: 'coach-weight-report',
  imports: [CoachPeriodControl, CoachReportState, TranslatePipe],
  templateUrl: './coach-weight-report.html',
  styleUrls: ['../coach-report.css', './coach-weight-report.css'],
})
export class CoachWeightReport {
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);
  private readonly compact = compactViewport();

  protected readonly store = inject(CoachClientDetailStore);
  protected readonly weightReport = inject(CoachWeightReportStore);
  protected readonly size = computed(() => (this.compact() ? COMPACT_CHART : WIDE_CHART));
  protected readonly labelY = computed(() => this.size().bottom + LABEL_OFFSET);
  protected readonly axisTextOffset = AXIS_TEXT_OFFSET;
  protected readonly goalTextOffset = GOAL_TEXT_OFFSET;
  protected readonly chart = computed(() =>
    buildWeightChart(sortedByLogTime(this.weightReport.weights()), this.store.profile()?.targetWeightKg ?? null, this.size()),
  );
  protected readonly stats = computed(() => weightStats(this.weightReport.weights()));
  protected readonly rows = computed(() => recentWeightRows(this.weightReport.weights(), RECENT_ROWS));
  protected readonly period = computed(() =>
    rangeLabel(this.weightReport.weightFrom(), this.weightReport.weightTo(), this.translate),
  );
  protected readonly remaining = computed(() => {
    const profile = this.store.profile();
    if (profile === null || profile.currentWeightKg === null || profile.targetWeightKg === null) {
      return null;
    }
    return Math.abs(profile.currentWeightKg - profile.targetWeightKg);
  });

  protected kg(value: number): string {
    return value.toFixed(WEIGHT_DECIMALS);
  }

  protected signed(value: number): string {
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${sign}${Math.abs(value).toFixed(WEIGHT_DECIMALS)}`;
  }

  protected trend(change: number | null): Trend {
    const profile = this.store.profile();
    if (change === null || change === 0 || profile === null) {
      return 'flat';
    }
    if (profile.currentWeightKg === null || profile.targetWeightKg === null) {
      return 'flat';
    }
    const wanted = Math.sign(profile.targetWeightKg - profile.currentWeightKg);
    return wanted === 0 ? 'flat' : Math.sign(change) === wanted ? 'good' : 'warn';
  }

  protected dayLabel(isoDate: string): string {
    return dayMonthLabel(isoDate, this.translate);
  }

  protected dateLabel(isoDate: string): string {
    return fullDateLabel(isoDate, this.translate);
  }

  protected weekday(isoDate: string): string {
    return weekdayLabel(isoDate, this.translate);
  }
}
