import { Injectable, inject, signal } from '@angular/core';
import { GetNotificationTemplatesUseCase } from '@application/notifications/get-notification-templates.use-case';
import { SendCustomNotificationUseCase } from '@application/notifications/send-custom-notification.use-case';
import { SendTemplatedNotificationUseCase } from '@application/notifications/send-templated-notification.use-case';
import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import {
  FALLBACK_TRAINER_STYLE,
  NotificationType,
} from '@domain/notifications/notification-attributes';
import {
  CustomNotificationInput,
  TemplatedNotificationInput,
} from '@domain/notifications/outgoing-notification';
import { TemplateCoverage, templateCoverage } from '@domain/notifications/template-coverage';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** The backend caps a page at 1000 rows; a type × style catalog stays far below that. */
const ALL_TEMPLATES = { first: 0, rows: 1000 };

/** State of the send form: the templates it previews and the send in flight. */
@Injectable()
export class NotificationSendStore {
  private readonly getTemplatesUseCase = inject(GetNotificationTemplatesUseCase);
  private readonly sendCustomUseCase = inject(SendCustomNotificationUseCase);
  private readonly sendTemplatedUseCase = inject(SendTemplatedNotificationUseCase);
  private readonly notifications = inject(NotificationService);

  private readonly templates = signal<readonly NotificationTemplate[]>([]);

  readonly templatesLoaded = signal(false);
  readonly sending = signal(false);

  async loadTemplates(): Promise<void> {
    try {
      this.templates.set((await this.getTemplatesUseCase.execute(ALL_TEMPLATES)).items);
      this.templatesLoaded.set(true);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  coverage(type: NotificationType): TemplateCoverage {
    return templateCoverage(this.templates(), type);
  }

  /** The Uzbek wording a trainee in the fallback style would receive, for the preview. */
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

  /** @returns true when the push went out, so the caller can clear the form. */
  sendCustom(input: CustomNotificationInput): Promise<boolean> {
    return this.send(() => this.sendCustomUseCase.execute(input));
  }

  /** @returns true when the push went out, so the caller can clear the form. */
  sendTemplated(input: TemplatedNotificationInput): Promise<boolean> {
    return this.send(() => this.sendTemplatedUseCase.execute(input));
  }

  private async send(dispatch: () => Promise<string>): Promise<boolean> {
    this.sending.set(true);
    try {
      const deliveryId = await dispatch();
      this.notifications.success(`Bildirishnoma yuborildi (yetkazish: ${deliveryId}).`);
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.sending.set(false);
    }
  }
}
