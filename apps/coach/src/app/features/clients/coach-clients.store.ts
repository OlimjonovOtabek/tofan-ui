import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { CoachClientSummary } from './models/coach-client';
import { CoachClientsService } from './services/coach-clients.service';

@Injectable()
export class CoachClientsStore {
  private readonly service = inject(CoachClientsService);

  readonly clients = signal<readonly CoachClientSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<ErrorMessage | null>(null);
  readonly query = signal('');
  readonly visibleClients = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.clients().filter((client) =>
      `${client.firstName} ${client.lastName}`.toLocaleLowerCase().includes(query),
    );
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.clients.set(await this.service.list());
    } catch (error) {
      this.clients.set([]);
      this.error.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
