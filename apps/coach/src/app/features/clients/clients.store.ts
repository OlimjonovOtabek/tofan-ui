import { Injectable, computed, inject, signal } from '@angular/core';
import { Client, countClients, filterClients } from '@coach/core/clients/client';
import { ClientFilter, DEFAULT_CLIENT_FILTER } from '@coach/core/clients/client-filter';
import { ClientsService } from '@coach/core/clients/clients.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class ClientsStore {
  private readonly service = inject(ClientsService);
  private readonly notifications = inject(NotificationService);

  readonly clients = signal<readonly Client[] | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly filter = signal<ClientFilter>(DEFAULT_CLIENT_FILTER);
  readonly query = signal('');
  readonly now = signal(new Date());

  readonly visible = computed(() =>
    filterClients(this.clients() ?? [], this.filter(), this.query(), this.now()),
  );
  readonly counts = computed<Readonly<Record<ClientFilter, number>>>(() => {
    const clients = this.clients() ?? [];
    const now = this.now();
    return {
      all: countClients(clients, 'all', now),
      active: countClients(clients, 'active', now),
      expiring: countClients(clients, 'expiring', now),
      lowActivity: countClients(clients, 'lowActivity', now),
      ended: countClients(clients, 'ended', now),
    };
  });

  async load(): Promise<void> {
    this.loadError.set(null);
    this.now.set(new Date());
    const hadData = this.clients() !== null;
    try {
      this.clients.set(await this.service.list());
    } catch (error) {
      if (hadData) {
        this.notifications.error(error);
      } else {
        this.loadError.set(toErrorMessage(error));
      }
    }
  }
}
