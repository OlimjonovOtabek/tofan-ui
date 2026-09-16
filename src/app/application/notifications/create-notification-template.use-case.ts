import {
  NotificationTemplateDraft,
  createNotificationTemplateDraft,
} from '@domain/notifications/notification-template-draft';
import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';

export class CreateNotificationTemplateUseCase {
  constructor(private readonly templateRepository: NotificationTemplateRepository) {}

  /**
   * @throws ValidationError when a text is empty or too long.
   * @throws ConflictError when another active template has the same type and style.
   */
  execute(draft: NotificationTemplateDraft): Promise<string> {
    return this.templateRepository.create(createNotificationTemplateDraft(draft));
  }
}
