import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageRequest } from '@shared/models/page';
import { isUuid } from '@shared/utils/identifiers';
import { UserSession, UserSessionStatus } from '../../models/user-session';
import { AppPaths } from '@core/config/app-paths';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { UserSessionsStore } from '../../user-sessions.store';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { formatDateTime } from '@core/i18n/date-format';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';

type TagSeverity = 'info' | 'secondary' | 'warn';

const STATUS_VIEW: Record<UserSessionStatus, { label: TranslationKey; severity: TagSeverity }> = {
  unexpired: { label: 'userSessions.status.unexpired', severity: 'info' },
  expired: { label: 'userSessions.status.expired', severity: 'secondary' },
  revokedEverywhere: { label: 'userSessions.status.revokedEverywhere', severity: 'warn' },
};

@Component({
  selector: 'app-user-sessions-page',
  imports: [DataTable, RouterLink, Button, Tag, TranslatePipe],
  providers: [UserSessionsStore],
  templateUrl: './user-sessions-page.html',
})
export class UserSessionsPage {
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(UserSessionsStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'userId', header: this.text('userSessions.columns.userId') },
    {
      field: 'createdOnUtc',
      header: this.text('userSessions.columns.loggedIn'),
      sortable: true,
      width: '12rem',
    },
    {
      field: 'expiresOnUtc',
      header: this.text('userSessions.columns.expires'),
      sortable: true,
      width: '12rem',
    },
    { field: 'status', header: this.text('userSessions.columns.status'), width: '13rem' },
    { field: 'actions', header: '', width: '11rem' },
  ]);

  protected readonly sendNotificationPath = AppPaths.sendNotification;
  protected readonly userSessionsPath = AppPaths.userSessions;
  protected readonly accountsPath = AppPaths.accounts;

  readonly userId = input<string>();

  constructor() {
    effect(() => {
      const userId = this.userId()?.trim() ?? '';
      untracked(() => void this.store.filterByUser(isUuid(userId) ? userId : null));
    });
  }

  protected statusLabel(session: UserSession): string {
    return this.text(STATUS_VIEW[session.status()].label);
  }

  protected statusSeverity(session: UserSession): TagSeverity {
    return STATUS_VIEW[session.status()].severity;
  }

  protected dateLabel(date: Date): string {
    return formatDateTime(date, this.localeStore.locale());
  }

  protected revokedHint(session: UserSession): string | null {
    return session.revokedAt === null
      ? null
      : this.translator.translate('userSessions.revokedAt', {
          date: this.dateLabel(session.revokedAt),
        });
  }

  protected copyUserId(session: UserSession): Promise<void> {
    return this.clipboard.copy(session.userId, 'userSessions.userId');
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  private text(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
