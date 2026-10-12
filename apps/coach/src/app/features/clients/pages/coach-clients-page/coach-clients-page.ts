import { Skeleton } from '@openng/optimus-ui/skeleton';
import { Message } from '@openng/optimus-ui/message';
import { Button } from '@openng/optimus-ui/button';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationKey } from '@core/i18n/dictionary';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { CoachClientSummary } from '../../models/coach-client';
import { FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { CoachClientsStore } from '../../coach-clients.store';
import { Translate, fullDateLabel } from '../../models/coach-report-dates';

const INITIALS_LENGTH = 1;

@Component({
  selector: 'coach-clients-page',
  imports: [Skeleton, Message, Button, MessagePipe, RouterLink, TranslatePipe],
  providers: [CoachClientsStore],
  templateUrl: './coach-clients-page.html',
  styleUrl: './coach-clients-page.css',
})
export class CoachClientsPage implements OnInit {
  protected readonly store = inject(CoachClientsStore);
  private readonly translator = inject(Translator);
  private readonly translate: Translate = (key) => this.translator.translate(key);

  ngOnInit(): void {
    void this.store.load();
  }

  protected queryChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.store.query.set(input.value);
    }
  }

  protected clearQuery(): void {
    this.store.query.set('');
  }

  protected dateLabel(value: string): string {
    return fullDateLabel(value, this.translate);
  }

  protected initials(client: CoachClientSummary): string {
    return `${client.firstName.slice(0, INITIALS_LENGTH)}${client.lastName.slice(0, INITIALS_LENGTH)}`;
  }

  protected goalKey(client: CoachClientSummary): TranslationKey {
    return client.goal === null ? 'coach.clients.noGoal' : FITNESS_GOAL_LABELS[client.goal];
  }

  protected weight(value: number | null): string {
    return value === null ? '—' : `${value} kg`;
  }
}
