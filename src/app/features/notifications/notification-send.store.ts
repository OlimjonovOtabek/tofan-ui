import { Injectable, inject, signal } from '@angular/core';
import { NotificationTemplate } from './models/notification-template';
import { FALLBACK_TRAINER_STYLE, NotificationType } from './models/notification-attributes';
import {
  CustomNotificationInput,
  TemplatedNotificationInput,
  createCustomNotification,
  createTemplatedNotification,
} from './models/outgoing-notification';
import { PushNotificationsService } from './services/push-notifications.service';
import { NotificationTemplatesService } from './services/notification-templates.service';
import { TemplateCoverage, templateCoverage } from './models/template-coverage';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

const ALL_TEMPLATES = { first: 0, rows: 1000 };

@Injectable()
export class NotificationSendStore {
  private readonly templatesService = inject(NotificationTemplatesService);
  private readonly pushNotificationsService = inject(PushNotificationsService);
  private readonly notifications = inject(NotificationService);

  private readonly templates = signal<readonly NotificationTemplate[]>([]);

  readonly templatesLoaded = signal(false);
  readonly templatesLoading = signal(false);
  readonly templatesError = signal<string | null>(null);
  readonly sending = signal(false);

  async loadTemplates(): Promise<void> {
    this.templatesLoading.set(true);
    this.templatesError.set(null);
    try {
      this.templates.set((await this.templatesService.list(ALL_TEMPLATES)).items);
      this.templatesLoaded.set(true);
    } catch (error) {
      this.templatesError.set(toErrorMessage(error));
    } finally {
      this.templatesLoading.set(false);
    }
  }

  coverage(type: NotificationType): TemplateCoverage {
    return templateCoverage(this.templates(), type);
  }

  fallbackTemplate(type: NotificationType): NotificationTemplate | null {
    return (
      this.templates().find(
        (template) =>
          template.isActive &&
          template.type === type &&
          template.trainerStyle === FALLBACK_TRAINER_STYLE,
      ) ?? null
    );
  }

  sendCustom(input: CustomNotificationInput): Promise<boolean> {
    return this.send(() =>
      this.pushNotificationsService.sendCustom(createCustomNotification(input)),
    );
  }

  sendTemplated(input: TemplatedNotificationInput): Promise<boolean> {
    return this.send(() =>
      this.pushNotificationsService.sendTemplated(createTemplatedNotification(input)),
    );
  }

  private async send(dispatch: () => Promise<string>): Promise<boolean> {
    this.sending.set(true);
    try {
      const deliveryId = await dispatch();
      this.notifications.success('notifications.send.sent', { deliveryId });
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.sending.set(false);
    }
  }
}
