import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ClientDetail } from './models/client-detail';
import { ClientDetailService } from './services/client-detail.service';

@Injectable()
export class ClientDetailStore {
  private readonly service = inject(ClientDetailService);

  readonly detail = signal<ClientDetail | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly now = signal(new Date());

  async load(userId: string): Promise<void> {
    this.loadError.set(null);
    const now = new Date();
    this.now.set(now);
    try {
      const client = await this.service.findClient(userId);
      if (client === null) {
        throw new NotFoundError('The client was not found.');
      }
      const ended = client.status === 'ended';
      const [profile, payments, adherence, sessions, nutrition] = await Promise.allSettled([
        this.service.profile(userId),
        this.service.payments(userId),
        ended ? Promise.reject(new Error('ended')) : this.service.adherence(userId),
        ended ? Promise.reject(new Error('ended')) : this.service.recentSessions(userId),
        ended ? Promise.reject(new Error('ended')) : this.service.todayNutrition(userId, now),
      ]);
      if (profile.status === 'rejected') {
        throw profile.reason;
      }
      this.detail.set({
        client: {
          ...client,
          adherencePercent: adherence.status === 'fulfilled' ? adherence.value.percent : null,
        },
        profile: profile.value,
        adherence: adherence.status === 'fulfilled' ? adherence.value : null,
        sessions: sessions.status === 'fulfilled' ? sessions.value : null,
        nutrition: nutrition.status === 'fulfilled' ? nutrition.value : null,
        nutritionLoaded: nutrition.status === 'fulfilled',
        payments: payments.status === 'fulfilled' ? payments.value : null,
      });
    } catch (error) {
      this.detail.set(null);
      this.loadError.set(toErrorMessage(error));
    }
  }
}
