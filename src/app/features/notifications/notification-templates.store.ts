import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationTemplate } from './models/notification-template';
import {
  NotificationTemplateDraft,
  createNotificationTemplateDraft,
} from './models/notification-template-draft';
import { NotificationTemplatesService } from './services/notification-templates.service';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { LocaleStore } from '@core/i18n/locale.store';

@Injectable()
export class NotificationTemplatesStore {
  private readonly templatesService = inject(NotificationTemplatesService);
  private readonly notifications = inject(NotificationService);
  private readonly localeStore = inject(LocaleStore);

  private readonly page = signal<Page<NotificationTemplate>>(emptyPage<NotificationTemplate>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly templates = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.templatesService.list(request));
    } catch (error) {
      this.page.set(emptyPage<NotificationTemplate>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(draft: NotificationTemplateDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.templatesService.create(createNotificationTemplateDraft(draft));
      } else {
        await this.templatesService.update(id, createNotificationTemplateDraft(draft));
      }
      this.notifications.success(
        id === null ? 'notifications.templates.created' : 'notifications.templates.saved',
      );
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(template: NotificationTemplate): Promise<void> {
    try {
      await this.templatesService.delete(template.id);
      this.notifications.success('notifications.templates.deleted', {
        name: template.titleIn(this.localeStore.locale()),
      });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
