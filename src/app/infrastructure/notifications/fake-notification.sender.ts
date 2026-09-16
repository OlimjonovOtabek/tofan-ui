import { Injectable, inject } from '@angular/core';
import { templateCoverage } from '@domain/notifications/template-coverage';
import {
  CustomNotification,
  TemplatedNotification,
} from '@domain/notifications/outgoing-notification';
import { NotificationSender } from '@domain/notifications/repositories/notification-sender';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { FakeNotificationTemplateRepository } from './fake-notification-template.repository';

const NETWORK_DELAY_MS = 400;

/**
 * Stand-in for the push pipeline under `useMockApi`. Nothing leaves the browser; a templated send
 * fails the way the backend does when no active template could be picked. Mock trainees have no
 * preferences, so the backend's default professional style is assumed.
 */
@Injectable()
export class FakeNotificationSender implements NotificationSender {
  private readonly templates = inject(FakeNotificationTemplateRepository);

  async sendCustom(notification: CustomNotification): Promise<string> {
    await delay();
    console.info('[mock] custom push', notification);
    return crypto.randomUUID();
  }

  async sendTemplated(notification: TemplatedNotification): Promise<string> {
    await delay();
    if (!templateCoverage(this.templates.snapshot(), notification.type).reachesEveryone) {
      throw new NotFoundError(
        'No active notification template was found for the requested type and trainer style.',
        'NotificationTemplate.NoActiveTemplate',
      );
    }
    console.info('[mock] templated push', notification);
    return crypto.randomUUID();
  }
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}
