import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import {
  Client,
  fullNameOf,
  initialsOfClient,
  isLowActivity,
  needsReview,
} from '@coach/core/clients/client';
import { CLIENT_FILTERS, ClientFilter, toClientFilter } from '@coach/core/clients/client-filter';
import {
  CLIENT_FILTER_LABELS,
  accessLeftText,
  lastActivityShortText,
} from '@coach/core/clients/client-text';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslationKey } from '@core/i18n/dictionary';
import { ClientsStore } from '../../clients.store';

interface ClientRow {
  readonly client: Client;
  readonly name: string;
  readonly initials: string;
  readonly access: string;
  readonly accessTone: string;
  readonly activity: string;
  readonly lowActivity: boolean;
  readonly review: boolean;
}

@Component({
  selector: 'coach-clients-page',
  imports: [TranslatePipe, MessagePipe, Avatar, EmptyState, Shimmer, TextField],
  providers: [ClientsStore],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage {
  protected readonly store = inject(ClientsStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);

  readonly filter = input<string | undefined>(undefined);

  protected readonly filters = CLIENT_FILTERS;
  protected readonly rows = computed<ClientRow[]>(() => {
    const now = this.store.now();
    return this.store.visible().map((client) => ({
      client,
      name: fullNameOf(client),
      initials: initialsOfClient(client),
      access: this.text(accessLeftText(client, now)),
      accessTone:
        client.status === 'ended'
          ? 'tone-error'
          : client.status === 'expiring'
            ? 'tone-warning'
            : 'tone-success',
      activity: this.text(lastActivityShortText(client, now)),
      lowActivity: isLowActivity(client, now),
      review: needsReview(client) && client.status !== 'ended',
    }));
  });

  constructor() {
    effect(() => {
      const filter = toClientFilter(this.filter());
      untracked(() => this.store.filter.set(filter));
    });
    void this.store.load();
  }

  protected label(filter: ClientFilter): string {
    return this.translator.translate(CLIENT_FILTER_LABELS[filter] as TranslationKey, {
      count: this.store.counts()[filter],
    });
  }

  protected select(filter: ClientFilter): void {
    this.store.filter.set(filter);
  }

  protected open(client: Client): void {
    void this.router.navigate(['/clients', client.userId]);
  }

  private text(text: { key: TranslationKey; params?: Record<string, string | number> }): string {
    return this.translator.translate(text.key, text.params);
  }
}
