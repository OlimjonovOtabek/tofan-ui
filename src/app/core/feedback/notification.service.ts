import { Injectable, inject } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { toErrorMessage } from './error-message';

const SUCCESS_LIFETIME_MS = 4000;
const ERROR_LIFETIME_MS = 8000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly translator = inject(Translator);

  success(detail: TranslationKey, params?: TranslationParams): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translator.translate('common.toast.success'),
      detail: this.translator.translate(detail, params),
      life: SUCCESS_LIFETIME_MS,
    });
  }

  info(detail: TranslationKey, params?: TranslationParams): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translator.translate('common.toast.info'),
      detail: this.translator.translate(detail, params),
      life: ERROR_LIFETIME_MS,
    });
  }

  error(error: unknown): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translator.translate('common.toast.error'),
      detail: this.translator.message(toErrorMessage(error)),
      life: ERROR_LIFETIME_MS,
    });
  }
}
