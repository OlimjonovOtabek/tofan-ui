import { Page, PageRequest } from '@domain/shared/paging/page';
import { NotificationTemplate } from '../entities/notification-template';
import { NotificationTemplateDraft } from '../notification-template-draft';

export abstract class NotificationTemplateRepository {
  abstract list(page: PageRequest): Promise<Page<NotificationTemplate>>;

  abstract getById(id: string): Promise<NotificationTemplate>;

  /**
   * @returns id of the created template.
   * @throws ConflictError when an active template already exists for the type and style.
   */
  abstract create(draft: NotificationTemplateDraft): Promise<string>;

  /** @throws ConflictError when an active template already exists for the type and style. */
  abstract update(id: string, draft: NotificationTemplateDraft): Promise<void>;

  abstract delete(id: string): Promise<void>;
}
