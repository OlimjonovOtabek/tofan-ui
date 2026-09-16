import { Component, inject, signal } from '@angular/core';
import { NotificationTemplate } from '../../models/notification-template';
import { NotificationTemplateDraft } from '../../models/notification-template-draft';
import { PageRequest } from '@shared/models/page';
import { NOTIFICATION_TYPE_LABELS, TRAINER_STYLE_LABELS } from '../../models/notification-labels';
import { NotificationTemplatesStore } from '../../notification-templates.store';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { NotificationTemplateFormDialog } from '../../components/notification-template-form-dialog/notification-template-form-dialog';

@Component({
  selector: 'app-notification-templates-page',
  imports: [DataTable, NotificationTemplateFormDialog, Button, Tag],
  providers: [NotificationTemplatesStore],
  templateUrl: './notification-templates-page.html',
})
export class NotificationTemplatesPage {
  private readonly confirmations = inject(ConfirmDialogService);

  protected readonly store = inject(NotificationTemplatesStore);

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'type', header: 'Turi', sortable: true },
    { field: 'trainerStyle', header: 'Uslub', sortable: true },
    { field: 'titleUz', header: 'Sarlavha va matn' },
    { field: 'isActive', header: 'Holati', width: '8rem' },
    { field: 'updatedOnUtc', header: 'Yangilangan', sortable: true, width: '10rem' },
    { field: 'actions', header: '', width: '8rem' },
  ];

  protected readonly dialogVisible = signal(false);
  protected readonly editedTemplate = signal<NotificationTemplate | null>(null);

  protected typeLabel(template: NotificationTemplate): string {
    return NOTIFICATION_TYPE_LABELS[template.type];
  }

  protected styleLabel(template: NotificationTemplate): string {
    return TRAINER_STYLE_LABELS[template.trainerStyle];
  }

  protected add(): void {
    this.editedTemplate.set(null);
    this.dialogVisible.set(true);
  }

  protected edit(template: NotificationTemplate): void {
    this.editedTemplate.set(template);
    this.dialogVisible.set(true);
  }

  protected async saveDraft(draft: NotificationTemplateDraft): Promise<void> {
    const saved = await this.store.save(draft, this.editedTemplate()?.id ?? null);
    if (saved) {
      this.dialogVisible.set(false);
    }
  }

  protected async remove(template: NotificationTemplate): Promise<void> {
    if (await this.confirmations.confirmDelete(template.displayTitle)) {
      await this.store.remove(template);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }
}
