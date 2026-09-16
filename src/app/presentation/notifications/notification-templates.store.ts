import { Injectable, computed, inject, signal } from '@angular/core';
import { CreateNotificationTemplateUseCase } from '@application/notifications/create-notification-template.use-case';
import { DeleteNotificationTemplateUseCase } from '@application/notifications/delete-notification-template.use-case';
import { GetNotificationTemplatesUseCase } from '@application/notifications/get-notification-templates.use-case';
import { UpdateNotificationTemplateUseCase } from '@application/notifications/update-notification-template.use-case';
import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import { Page, PageRequest, emptyPage, firstPage } from '@domain/shared/paging/page';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** View state of the template list: one page and the operations on it. */
@Injectable()
export class NotificationTemplatesStore {
  private readonly getTemplatesUseCase = inject(GetNotificationTemplatesUseCase);
  private readonly createTemplateUseCase = inject(CreateNotificationTemplateUseCase);
  private readonly updateTemplateUseCase = inject(UpdateNotificationTemplateUseCase);
  private readonly deleteTemplateUseCase = inject(DeleteNotificationTemplateUseCase);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<NotificationTemplate>>(emptyPage<NotificationTemplate>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly templates = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.getTemplatesUseCase.execute(request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  /** @returns true when the template was saved, so the caller can close its dialog. */
  async save(draft: NotificationTemplateDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.createTemplateUseCase.execute(draft);
      } else {
        await this.updateTemplateUseCase.execute(id, draft);
      }
      this.notifications.success(id === null ? "Shablon qo'shildi." : 'Shablon saqlandi.');
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
      await this.deleteTemplateUseCase.execute(template.id);
      this.notifications.success(`"${template.displayTitle}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
