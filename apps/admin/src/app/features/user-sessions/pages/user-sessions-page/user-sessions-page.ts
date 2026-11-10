import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageRequest } from '@shared/models/page';
import { isUuid, shortId } from '@shared/utils/identifiers';
import { UserSessionFilters } from '../../components/user-session-filters/user-session-filters';
import { toSessionDevice } from '../../models/session-device';
import { UserSession } from '../../models/user-session';
import { SessionListFilter } from '../../models/user-session-filter';
import {
  SESSION_DEVICE_FALLBACK_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_SEVERITIES,
  SessionTagSeverity,
} from '../../models/user-session-labels';
import { AppPaths } from '@core/config/app-paths';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
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

interface SessionRow {
  readonly session: UserSession;
  readonly user: string;
  readonly userIsId: boolean;
  readonly device: string;
  readonly deviceIsKnown: boolean;
}

@Component({
  selector: 'app-user-sessions-page',
  imports: [CatalogHeader, DataTable, RouterLink, Button, Tag, TranslatePipe, UserSessionFilters],
  providers: [UserSessionsStore],
  templateUrl: './user-sessions-page.html',
})
export class UserSessionsPage {
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(UserSessionsStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'userName', header: this.text('userSessions.columns.user'), sortable: true },
    { field: 'userAgent', header: this.text('userSessions.columns.device') },
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

  protected readonly rows = computed<readonly SessionRow[]>(() =>
    this.store.sessions().map((session) => this.toRow(session)),
  );

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
    return this.text(SESSION_STATUS_LABELS[session.status()]);
  }

  protected statusSeverity(session: UserSession): SessionTagSeverity {
    return SESSION_STATUS_SEVERITIES[session.status()];
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

  protected applyFilter(filter: SessionListFilter): void {
    void this.store.applyFilter(filter);
  }

  private toRow(session: UserSession): SessionRow {
    const device = toSessionDevice(session.userAgent);
    return {
      session,
      user: session.userName ?? shortId(session.userId),
      userIsId: session.userName === null,
      device: device.name ?? this.text(SESSION_DEVICE_FALLBACK_LABELS[device.kind]),
      deviceIsKnown: device.kind !== 'unknown',
    };
  }

  private text(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
