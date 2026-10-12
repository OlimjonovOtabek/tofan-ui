import { Component, computed, inject, signal } from '@angular/core';
import { formatDate } from '@core/i18n/date-format';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
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
  imports: [DataTable, NotificationTemplateFormDialog, Button, Tag, TranslatePipe],
  providers: [NotificationTemplatesStore],
  templateUrl: './notification-templates-page.html',
})
export class NotificationTemplatesPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);

  protected readonly locale = inject(LocaleStore).locale;

  protected readonly store = inject(NotificationTemplatesStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'type', header: this.text('notifications.templates.columns.type'), sortable: true },
    {
      field: 'trainerStyle',
      header: this.text('notifications.templates.columns.style'),
      sortable: true,
    },
    { field: 'title', header: this.text('notifications.templates.columns.text') },
    {
      field: 'isActive',
      header: this.text('notifications.templates.columns.status'),
      width: '8rem',
    },
    {
      field: 'updatedOnUtc',
      header: this.text('notifications.templates.columns.updated'),
      sortable: true,
      width: '10rem',
    },
    { field: 'actions', header: '', width: '8rem' },
  ]);

  protected readonly dialogVisible = signal(false);
  protected readonly editedTemplate = signal<NotificationTemplate | null>(null);

  protected typeLabel(template: NotificationTemplate): string {
    return this.text(NOTIFICATION_TYPE_LABELS[template.type]);
  }

  protected styleLabel(template: NotificationTemplate): string {
    return this.text(TRAINER_STYLE_LABELS[template.trainerStyle]);
  }

  protected updatedLabel(template: NotificationTemplate): string {
    return formatDate(template.updatedAt, this.locale());
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
    if (await this.confirmations.confirmDelete(template.titleIn(this.locale()))) {
      await this.store.remove(template);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  private text(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
