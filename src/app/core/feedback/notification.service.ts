import { Injectable, inject } from '@angular/core';
import { toErrorMessage } from './error-message';
import { MessageService } from '@openng/optimus-ui/api';

const SUCCESS_LIFETIME_MS = 4000;
const ERROR_LIFETIME_MS = 8000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);

  success(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Bajarildi',
      detail,
      life: SUCCESS_LIFETIME_MS,
    });
  }

  info(detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary: "Ma'lumot",
      detail,
      life: ERROR_LIFETIME_MS,
    });
  }

  error(error: unknown): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Xatolik',
      detail: toErrorMessage(error),
      life: ERROR_LIFETIME_MS,
    });
  }
}
