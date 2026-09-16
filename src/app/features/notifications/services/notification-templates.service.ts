import { Injectable, inject } from '@angular/core';
import { NotificationTemplate } from '../models/notification-template';
import { NotificationTemplateDraft } from '../models/notification-template-draft';
import { Page, PageRequest } from '@shared/models/page';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { NotificationTemplateResponse } from './notification.dto';
import { toNotificationTemplate, toNotificationTemplateRequest } from './notification.mapper';

const TEMPLATES = '/notification-templates';

@Injectable({ providedIn: 'root' })
export class NotificationTemplatesService {
  private readonly apiClient = inject(ApiClient);

  async list(page: PageRequest): Promise<Page<NotificationTemplate>> {
    const list = await this.apiClient.get<PagedList<NotificationTemplateResponse>>(
      TEMPLATES,
      toPagedQuery(page),
    );
    return toPage(list, toNotificationTemplate);
  }

  async getById(id: string): Promise<NotificationTemplate> {
    return toNotificationTemplate(
      await this.apiClient.get<NotificationTemplateResponse>(templatePath(id)),
    );
  }

  create(draft: NotificationTemplateDraft): Promise<string> {
    return this.apiClient.post<string>(TEMPLATES, toNotificationTemplateRequest(draft));
  }

  async update(id: string, draft: NotificationTemplateDraft): Promise<void> {
    await this.apiClient.put(templatePath(id), toNotificationTemplateRequest(draft));
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(templatePath(id));
  }
}

function templatePath(id: string): string {
  return `${TEMPLATES}/${encodeURIComponent(id)}`;
}
