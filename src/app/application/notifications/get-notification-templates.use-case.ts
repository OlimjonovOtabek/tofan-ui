import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';
import { Page, PageRequest } from '@domain/shared/paging/page';

export class GetNotificationTemplatesUseCase {
  constructor(private readonly templateRepository: NotificationTemplateRepository) {}

  execute(page: PageRequest): Promise<Page<NotificationTemplate>> {
    return this.templateRepository.list(page);
  }
}
