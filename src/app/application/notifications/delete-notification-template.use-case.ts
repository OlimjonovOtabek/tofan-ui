import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';

export class DeleteNotificationTemplateUseCase {
  constructor(private readonly templateRepository: NotificationTemplateRepository) {}

  execute(id: string): Promise<void> {
    return this.templateRepository.delete(id);
  }
}
