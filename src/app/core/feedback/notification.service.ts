import { Injectable, inject } from '@angular/core';
import { toErrorMessage } from './error-message';
import { MessageService } from '@openng/optimus-ui/api';
import { Translator } from '@core/i18n/translator';

const SUCCESS_LIFETIME_MS = 4000;
const ERROR_LIFETIME_MS = 8000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly translator = inject(Translator);

  success(detailKey: string, params?: Record<string, string | number>): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translator.translate('common.success'),
      detail: this.translator.translate(detailKey, params),
      life: SUCCESS_LIFETIME_MS,
    });
  }

  info(detailKey: string, params?: Record<string, string | number>): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translator.translate('common.info'),
      detail: this.translator.translate(detailKey, params),
      life: ERROR_LIFETIME_MS,
    });
  }

  error(error: unknown): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translator.translate('common.error'),
      detail: this.translator.translate(toErrorMessage(error)),
      life: ERROR_LIFETIME_MS,
    });
  }
}
