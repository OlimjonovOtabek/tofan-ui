import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';

/** Copies ids and the like, and shows the text instead when the browser refuses. */
@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly notifications = inject(NotificationService);

  async copy(text: string, what: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.notifications.success(`${what} nusxalandi.`);
    } catch {
      this.notifications.info(`Nusxalab bo'lmadi. ${what}: ${text}`);
    }
  }
}
