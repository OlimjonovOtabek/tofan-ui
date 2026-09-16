import { Injectable, inject } from '@angular/core';
import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { ApiClient } from '@infrastructure/api/api-client';
import { toPage, toPagedQuery } from '@infrastructure/api/paging.mapper';
import {
  deleteNotificationTemplatesById,
  getNotificationTemplates,
  getNotificationTemplatesById,
  postNotificationTemplates,
  putNotificationTemplatesById,
} from '@infrastructure/api/generated';
import { toNotificationTemplate, toNotificationTemplateRequest } from './notification.mapper';

@Injectable()
export class HttpNotificationTemplateRepository implements NotificationTemplateRepository {
  private readonly apiClient = inject(ApiClient);

  async list(page: PageRequest): Promise<Page<NotificationTemplate>> {
    const list = await this.apiClient.invoke(getNotificationTemplates, toPagedQuery(page));
    return toPage(list, toNotificationTemplate);
  }

  async getById(id: string): Promise<NotificationTemplate> {
    return toNotificationTemplate(
      await this.apiClient.invoke(getNotificationTemplatesById, { id }),
    );
  }

  create(draft: NotificationTemplateDraft): Promise<string> {
    return this.apiClient.invoke(postNotificationTemplates, {
      body: toNotificationTemplateRequest(draft),
    });
  }

  async update(id: string, draft: NotificationTemplateDraft): Promise<void> {
    await this.apiClient.invoke(putNotificationTemplatesById, {
      id,
      body: toNotificationTemplateRequest(draft),
    });
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.invoke(deleteNotificationTemplatesById, { id });
  }
}
