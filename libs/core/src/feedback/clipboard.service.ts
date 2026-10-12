import { Injectable, inject } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly notifications = inject(NotificationService);
  private readonly translator = inject(Translator);

  async copy(text: string, what: TranslationKey): Promise<void> {
    const subject = this.translator.translate(what);
    try {
      await navigator.clipboard.writeText(text);
      this.notifications.success('common.clipboard.copied', { what: subject });
    } catch {
      this.notifications.info('common.clipboard.failed', { what: subject, text });
    }
  }
}
