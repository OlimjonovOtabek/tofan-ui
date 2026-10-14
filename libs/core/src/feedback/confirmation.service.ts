import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';

export interface ConfirmText {
  readonly key: TranslationKey;
  readonly params?: TranslationParams;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translator = inject(Translator);

  confirmDelete(subject: string, warning?: ConfirmText): Promise<boolean> {
    const question = this.translator.translate('common.confirm.deleteQuestion', { subject });
    return this.ask({
      header: this.translator.translate('common.confirm.deleteHeader'),
      message: warning === undefined ? question : `${this.textOf(warning)} ${question}`,
      icon: 'pi pi-trash',
      acceptLabel: this.translator.translate('common.actions.delete'),
      acceptButtonStyleClass: 'p-button-danger',
    });
  }

  confirm(
    message: ConfirmText,
    header: TranslationKey = 'common.confirm.header',
  ): Promise<boolean> {
    return this.ask({
      header: this.translator.translate(header),
      message: this.textOf(message),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translator.translate('common.actions.yes'),
    });
  }

  private textOf(text: ConfirmText): string {
    return this.translator.translate(text.key, text.params);
  }

  private ask(options: {
    header: string;
    message: string;
    icon: string;
    acceptLabel: string;
    acceptButtonStyleClass?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        ...options,
        rejectLabel: this.translator.translate('common.actions.cancel'),
        rejectButtonStyleClass: 'p-button-text',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
