import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Adherence, Client } from './client';
import { AdherenceResponse, ClientSummaryResponse } from './client.dto';
import { toAdherence, toClient } from './client.mapper';

const CLIENTS = '/coach/clients';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly api = inject(ApiClient);

  async list(): Promise<Client[]> {
    const summaries = (await this.api.get<ClientSummaryResponse[]>(CLIENTS)).filter(
      (summary) => summary.userId,
    );
    const percents = await Promise.all(
      summaries.map((summary) =>
        summary.status === 3 ? Promise.resolve(null) : this.adherencePercentOf(summary.userId),
      ),
    );
    return summaries.map((summary, index) => toClient(summary, percents[index]));
  }

  async adherence(userId: string): Promise<Adherence> {
    return toAdherence(
      await this.api.get<AdherenceResponse>(`${CLIENTS}/${encodeURIComponent(userId)}/adherence`),
    );
  }

  private async adherencePercentOf(userId: string): Promise<number | null> {
    try {
      return (await this.adherence(userId)).percent;
    } catch {
      return null;
    }
  }
}
