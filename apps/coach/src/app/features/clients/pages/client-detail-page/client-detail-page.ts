import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { adherenceLevel, fullNameOf, initialsOfClient } from '@coach/core/clients/client';
import { accessLeftText } from '@coach/core/clients/client-text';
import { EXPERIENCE_LEVEL_LABELS, placeLabel } from '@coach/core/fitness/experience-level';
import { FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import {
  daysBetween,
  formatCount,
  formatDayMonth,
  formatDecimal,
} from '@coach/core/format/formats';
import { PaymentRow } from '@coach/core/payments/payment-row';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { MetricTile } from '@coach/core/ui/metric-tile/metric-tile';
import { Progress } from '@coach/core/ui/progress/progress';
import { SectionCard } from '@coach/core/ui/section-card/section-card';
import { SectionHeader } from '@coach/core/ui/section-header/section-header';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { StatTile, TileTone } from '@coach/core/ui/stat-tile/stat-tile';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ClientDetailStore } from '../../client-detail.store';
import {
  SessionStatus,
  SessionSummary,
  ageOf,
  calorieIntakePercent,
  completionProgress,
  weightChangeKg,
  weightProgress,
} from '../../models/client-detail';

const SESSION_STATUS_KEYS: Readonly<Record<SessionStatus, TranslationKey>> = {
  planned: 'coachApp.workoutStatus.planned',
  started: 'coachApp.workoutStatus.started',
  completed: 'coachApp.workoutStatus.completed',
  skipped: 'coachApp.workoutStatus.skipped',
  cancelled: 'coachApp.workoutStatus.cancelled',
};

@Component({
  selector: 'coach-client-detail-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    Avatar,
    Button,
    EmptyState,
    Icon,
    MetricTile,
    PaymentRow,
    Progress,
    SectionCard,
    SectionHeader,
    Shimmer,
    StatTile,
  ],
  providers: [ClientDetailStore],
  templateUrl: './client-detail-page.html',
  styleUrl: './client-detail-page.css',
})
export class ClientDetailPage {
  protected readonly store = inject(ClientDetailStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly userId = input.required<string>();

  protected readonly view = computed(() => {
    const detail = this.store.detail();
    if (detail === null) {
      return null;
    }
    const t = this.t;
    const { client, profile, adherence, nutrition } = detail;
    const locale = this.locale();
    const now = this.store.now();
    const unknown = t('coachApp.common.unknown');
    const change = weightChangeKg(profile);
    const target = profile.targetWeightKg;
    const level = adherenceLevel(adherence?.percent ?? null);
    const intake = calorieIntakePercent(nutrition);
    const kg = (value: number) => formatDecimal(value, locale, 1);
    const access = accessLeftText(client, now);
    return {
      name: fullNameOf({ firstName: profile.firstName, lastName: profile.lastName }),
      initials: initialsOfClient({ firstName: profile.firstName, lastName: profile.lastName }),
      goal: profile.goal === null ? null : t(FITNESS_GOAL_LABELS[profile.goal]),
      access: t(access.key, access.params),
      accessTone:
        client.status === 'ended'
          ? 'neutral'
          : client.status === 'expiring'
            ? 'warning'
            : 'success',
      weight: profile.currentWeightKg === null ? unknown : kg(profile.currentWeightKg),
      weightUnit: profile.currentWeightKg === null ? null : t('coachApp.units.kg'),
      weightGoal:
        target === null
          ? null
          : change === null
            ? t('coachApp.clientDetail.weightGoal', { target: formatDecimal(target, locale, 1) })
            : t('coachApp.clientDetail.weightGoalChange', {
                target: formatDecimal(target, locale, 1),
                change: `${change > 0 ? '+' : ''}${kg(change)}`,
              }),
      weightProgress: weightProgress(profile),
      adherence: adherence === null ? unknown : String(adherence.percent),
      adherenceGoal:
        adherence === null
          ? null
          : t('coachApp.workout.adherenceMissed', { count: adherence.missedDays }),
      adherenceTone: (level === null
        ? 'muted'
        : level === 'high'
          ? 'primary'
          : level === 'good'
            ? 'info'
            : 'warning') as TileTone,
      completed: adherence === null ? unknown : String(adherence.completedDays),
      scheduled: adherence === null ? null : `/ ${adherence.scheduledDays}`,
      completion: completionProgress(adherence),
      calories: nutrition === null ? unknown : formatCount(nutrition.targetCalories, locale),
      caloriesGoal:
        intake === null
          ? t('coachApp.clientDetail.caloriesNone')
          : t('coachApp.clientDetail.caloriesIntake', { percent: intake }),
      intake: intake === null ? null : Math.min(intake / 100, 1),
      facts: this.facts(detail.profile, now),
      level:
        profile.experienceLevel === null
          ? null
          : t(EXPERIENCE_LEVEL_LABELS[profile.experienceLevel]),
      place: profile.isHomeWorkout === null ? null : t(placeLabel(profile.isHomeWorkout)),
      levelPlace: [
        profile.experienceLevel === null
          ? null
          : t(EXPERIENCE_LEVEL_LABELS[profile.experienceLevel]),
        profile.isHomeWorkout === null ? null : t(placeLabel(profile.isHomeWorkout)),
      ]
        .filter((part) => part !== null)
        .join(' · '),
      days: profile.workoutDaysPerWeek,
      sessions: detail.sessions?.map((session) => this.session(session, now)) ?? null,
      payments: detail.payments,
    };
  });

  constructor() {
    effect(() => {
      const id = this.userId();
      untracked(() => void this.store.load(id));
    });
  }

  protected count(value: number): string {
    return formatCount(value, this.locale());
  }

  protected openChat(name: string): void {
    void this.router.navigate(['/chat/with', this.userId()], { queryParams: { name } });
  }

  private readonly t = (key: TranslationKey, params?: Record<string, string | number>) =>
    this.translator.translate(key, params);

  private facts(
    profile: NonNullable<ReturnType<ClientDetailStore['detail']>>['profile'],
    now: Date,
  ): string | null {
    const parts = [
      profile.dateOfBirth === null ? null : String(ageOf(profile.dateOfBirth, now)),
      profile.heightCm === null
        ? null
        : `${Math.round(profile.heightCm)} ${this.t('coachApp.units.cm')}`,
      profile.currentWeightKg === null
        ? null
        : `${formatDecimal(profile.currentWeightKg, this.locale(), 1)} ${this.t('coachApp.units.kg')}`,
    ].filter((part) => part !== null);
    return parts.length === 0 ? null : parts.join(' · ');
  }

  private session(session: SessionSummary, now: Date) {
    const started = session.startedOn;
    const days = started === null ? null : daysBetween(started, now);
    const date =
      started === null
        ? ''
        : days === 0
          ? this.t('coachApp.workout.dateToday')
          : days === 1
            ? this.t('coachApp.workout.dateYesterday')
            : formatDayMonth(started, this.locale());
    return {
      id: session.id,
      title: session.title || this.t('coachApp.common.unknown'),
      status: this.t(SESSION_STATUS_KEYS[session.status]),
      tone:
        session.status === 'completed'
          ? 'success'
          : session.status === 'skipped' || session.status === 'cancelled'
            ? 'warning'
            : 'info',
      meta:
        started === null
          ? null
          : this.t('coachApp.workout.historyMeta', {
              date,
              minutes: session.durationMinutes,
              kcal: session.caloriesBurned,
            }),
      volume: formatCount(session.volumeKg, this.locale()),
      sets: String(session.completedSets),
    };
  }
}
