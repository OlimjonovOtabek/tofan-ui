import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from '@openng/optimus-ui/api';

/** Wraps the confirm dialog in a promise, so callers can `await` the user's answer. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);

  /** `warning` is put in front of the question when deleting has consequences elsewhere. */
  confirmDelete(subject: string, warning?: string): Promise<boolean> {
    const question = `"${subject}" o'chirilsinmi? Buni qaytarib bo'lmaydi.`;
    return this.ask({
      header: "O'chirishni tasdiqlang",
      message: warning === undefined ? question : `${warning} ${question}`,
      icon: 'pi pi-trash',
      acceptLabel: "O'chirish",
      acceptButtonStyleClass: 'p-button-danger',
    });
  }

  confirm(message: string, header = 'Tasdiqlang'): Promise<boolean> {
    return this.ask({ header, message, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Ha' });
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
        rejectLabel: 'Bekor qilish',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
