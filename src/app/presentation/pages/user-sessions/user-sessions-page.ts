import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageRequest } from '@domain/shared/paging/page';
import { UserSession, UserSessionStatus } from '@domain/user-sessions/entities/user-session';
import { AppPaths } from '@presentation/routing/app-paths';
import { DataTable, DataTableColumn } from '@presentation/shared/components/data-table/data-table';
import { ClipboardService } from '@presentation/shared/feedback/clipboard.service';
import { UserSessionsStore } from '@presentation/user-sessions/user-sessions.store';
import { Button } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';

type TagSeverity = 'info' | 'secondary' | 'warn';

const STATUS_VIEW: Record<UserSessionStatus, { label: string; severity: TagSeverity }> = {
  unexpired: { label: 'Muddati tugamagan', severity: 'info' },
  expired: { label: 'Muddati tugagan', severity: 'secondary' },
  revokedEverywhere: { label: 'Hamma joydan chiqilgan', severity: 'warn' },
};

@Component({
  selector: 'app-user-sessions-page',
  imports: [DataTable, RouterLink, Button, Tag],
  providers: [UserSessionsStore],
  templateUrl: './user-sessions-page.html',
})
export class UserSessionsPage {
  private readonly clipboard = inject(ClipboardService);

  protected readonly store = inject(UserSessionsStore);

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'userId', header: 'Foydalanuvchi ID' },
    { field: 'createdOnUtc', header: 'Kirgan vaqti', sortable: true, width: '12rem' },
    { field: 'expiresOnUtc', header: 'Token muddati', sortable: true, width: '12rem' },
    { field: 'status', header: 'Holati', width: '13rem' },
    { field: 'actions', header: '', width: '8rem' },
  ];

  protected readonly sendNotificationPath = AppPaths.sendNotification;

  /**
   * Row templates are handed to the table as content, so Angular cannot infer their type and the
   * row arrives as `any`. These accessors put the typing back in one place.
   */
  protected statusLabel(session: UserSession): string {
    return STATUS_VIEW[session.status()].label;
  }

  protected statusSeverity(session: UserSession): TagSeverity {
    return STATUS_VIEW[session.status()].severity;
  }

  protected dateLabel(date: Date): string {
    return date.toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' });
  }

  protected revokedHint(session: UserSession): string | null {
    return session.revokedAt === null ? null : `Chiqilgan: ${this.dateLabel(session.revokedAt)}`;
  }

  protected copyUserId(session: UserSession): Promise<void> {
    return this.clipboard.copy(session.userId, 'Foydalanuvchi ID');
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }
}
