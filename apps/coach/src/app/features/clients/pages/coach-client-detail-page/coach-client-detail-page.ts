import { Skeleton } from '@openng/optimus-ui/skeleton';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslationKey } from '@core/i18n/dictionary';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { CLIENT_DETAIL_STORES } from '../../coach-client-detail.providers';
import { CoachClientDetailStore } from '../../coach-client-detail.store';
import { CoachNutritionReport } from '../../components/coach-nutrition-report/coach-nutrition-report';
import { Translate, fullDateLabel } from '../../models/coach-report-dates';
import { CoachWeightReport } from '../../components/coach-weight-report/coach-weight-report';
import { CoachWorkoutReport } from '../../components/coach-workout-report/coach-workout-report';

type ClientReportTab = 'weight' | 'workouts' | 'nutrition';

const REPORT_TABS: readonly { key: ClientReportTab; label: TranslationKey }[] = [
  { key: 'weight', label: 'coach.clients.weight' },
  { key: 'workouts', label: 'coach.clients.workouts' },
  { key: 'nutrition', label: 'coach.clients.nutrition' },
];
const INITIALS_LENGTH = 1;

@Component({
  selector: 'coach-client-detail-page',
  imports: [
    Skeleton,
    MessagePipe,
    RouterLink,
    TranslatePipe,
    CoachNutritionReport,
    CoachWeightReport,
    CoachWorkoutReport,
  ],
  providers: [...CLIENT_DETAIL_STORES],
  templateUrl: './coach-client-detail-page.html',
  styleUrl: './coach-client-detail-page.css',
})
export class CoachClientDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);

  protected readonly store = inject(CoachClientDetailStore);
  protected readonly tabs = REPORT_TABS;
  protected readonly tab = signal<ClientReportTab>('weight');
  protected readonly clientName = computed(() => {
    const profile = this.store.profile();
    return profile === null ? '' : `${profile.firstName} ${profile.lastName}`;
  });
  protected readonly initials = computed(() => {
    const profile = this.store.profile();
    return profile === null
      ? ''
      : `${profile.firstName.slice(0, INITIALS_LENGTH)}${profile.lastName.slice(0, INITIALS_LENGTH)}`;
  });
  protected readonly goalKey = computed<TranslationKey>(() => {
    const goal = this.store.profile()?.goal ?? null;
    return goal === null ? 'coach.clients.noGoal' : FITNESS_GOAL_LABELS[goal];
  });
  protected readonly subscriptionEnd = computed(() => {
    const summary = this.store.summary();
    return summary === null ? null : fullDateLabel(summary.subscriptionEndsOnUtc, this.translate);
  });

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId !== null) {
      void this.store.load(userId);
    }
  }
}
