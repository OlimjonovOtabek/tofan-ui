import { Component, computed, inject } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { SelectField } from '@shared/components/select-field/select-field';
import { TranslationKey } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AdherenceDayKind, adherenceDayKind, mondayBasedWeekday } from '../../models/coach-adherence-days';
import { CoachWorkoutReportStore } from '../../coach-workout-report.store';
import { CoachPeriodControl } from '../coach-period-control/coach-period-control';
import { Translate, dayMonthLabel, rangeLabel, shortWeekdayNames } from '../../models/coach-report-dates';
import { toIsoDate } from '../../models/coach-report-period';
import { CoachReportState } from '../coach-report-state/coach-report-state';
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_OPTIONS,
  SessionStatus,
  SessionTone,
  sessionTone,
} from '../../models/coach-session-status';

const DAY_KIND_LABELS: Record<AdherenceDayKind, TranslationKey> = {
  completed: 'coach.clients.completed',
  missed: 'coach.clients.missed',
  rest: 'coach.clients.rest',
  planned: 'coach.clients.status.planned',
};
const DAY_KIND_ICONS: Record<AdherenceDayKind, string> = {
  completed: 'pi pi-check',
  missed: 'pi pi-times',
  rest: 'pi pi-clock',
  planned: 'pi pi-calendar',
};
const LEGEND_KINDS: readonly AdherenceDayKind[] = ['completed', 'missed', 'rest', 'planned'];
const ISO_DAY_START = 8;
const TIME_PART_LENGTH = 2;

@Component({
  selector: 'coach-workout-report',
  imports: [ButtonDirective, SelectField, CoachPeriodControl, CoachReportState, TranslatePipe],
  templateUrl: './coach-workout-report.html',
  styleUrls: ['../coach-report.css', './coach-workout-report.css'],
})
export class CoachWorkoutReport {
  private readonly locale = inject(LocaleStore);
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);

  protected readonly workoutReport = inject(CoachWorkoutReportStore);
  protected readonly legend = LEGEND_KINDS.map((kind) => ({ kind, label: DAY_KIND_LABELS[kind] }));
  protected readonly weekdays = computed(() => shortWeekdayNames(this.translate));
  protected readonly period = computed(() =>
    rangeLabel(this.workoutReport.sessionFrom(), this.workoutReport.sessionTo(), this.translate),
  );
  protected readonly statusOptions = computed(() => this.translator.options(SESSION_STATUS_OPTIONS));
  protected readonly calendar = computed(() => {
    const days = this.workoutReport.adherence()?.days ?? [];
    return {
      leading: Array.from({ length: days.length === 0 ? 0 : mondayBasedWeekday(days[0].date) }, (_, index) => index),
      cells: days.map((day) => {
        const kind = adherenceDayKind(day);
        return { date: day.date, number: Number(day.date.slice(ISO_DAY_START)), kind, icon: DAY_KIND_ICONS[kind], label: DAY_KIND_LABELS[kind] };
      }),
    };
  });

  protected statusChanged(status: SessionStatus | null): void {
    void this.workoutReport.setSessionStatus(status);
  }

  protected statusKey(status: SessionStatus): TranslationKey {
    return SESSION_STATUS_LABELS[status];
  }

  protected tone(status: SessionStatus): SessionTone {
    return sessionTone(status);
  }

  protected startedLabel(startedOnUtc: string): string {
    const local = new Date(startedOnUtc);
    const time = `${twoDigits(local.getHours())}:${twoDigits(local.getMinutes())}`;
    return `${dayMonthLabel(toIsoDate(local), this.translate)} · ${time}`;
  }

  protected dayLabel(isoDate: string): string {
    return dayMonthLabel(isoDate, this.translate);
  }

  protected amount(value: number): string {
    return Math.round(value).toLocaleString(INTL_LOCALES[this.locale.locale()]);
  }
}

function twoDigits(value: number): string {
  return String(value).padStart(TIME_PART_LENGTH, '0');
}
