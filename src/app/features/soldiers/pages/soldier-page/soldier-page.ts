import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import {
  Button,
  ButtonDirective,
  ButtonIcon,
  ButtonLabel,
} from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { Tag } from '@openng/optimus-ui/tag';
import { WeightHistoryChart } from '../../components/weight-history-chart/weight-history-chart';
import { FITNESS_GOAL_LABELS, WEIGHT_SOURCE_LABELS } from '../../models/soldier-labels';
import { WeightEntry } from '../../models/weight-entry';
import { SoldierStore } from '../../soldier.store';

@Component({
  selector: 'app-soldier-page',
  imports: [
    RouterLink,
    Button,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Tag,
    WeightHistoryChart,
  ],
  providers: [SoldierStore],
  templateUrl: './soldier-page.html',
})
export class SoldierPage {
  protected readonly store = inject(SoldierStore);

  protected readonly soldiersPath = AppPaths.soldiers;
  protected readonly accountsPath = AppPaths.accounts;
  protected readonly sendNotificationPath = AppPaths.sendNotification;

  readonly userId = input.required<string>();

  protected readonly goalLabel = computed(() => {
    const goal = this.store.profile()?.goal ?? null;
    return goal === null ? null : FITNESS_GOAL_LABELS[goal];
  });

  protected readonly changeLabel = computed(() => {
    const change = this.store.weightChange();
    if (change === null) {
      return null;
    }
    const sign = change.deltaKg > 0 ? '+' : '';
    return `${change.firstKg} → ${change.lastKg} kg (${sign}${change.deltaKg} kg)`;
  });

  constructor() {
    effect(() => {
      const userId = this.userId();
      untracked(() => void this.store.load(userId));
    });
  }

  protected loggedLabel(entry: WeightEntry): string {
    return entry.loggedAt.toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' });
  }

  protected sourceLabel(entry: WeightEntry): string {
    return WEIGHT_SOURCE_LABELS[entry.source];
  }
}
