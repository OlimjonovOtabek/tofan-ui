import { Injectable, computed, inject, signal } from '@angular/core';
import { GetUserSessionsUseCase } from '@application/user-sessions/get-user-sessions.use-case';
import { Page, PageRequest, emptyPage, firstPage } from '@domain/shared/paging/page';
import { UserSession } from '@domain/user-sessions/entities/user-session';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** View state of the login journal: one page of records. */
@Injectable()
export class UserSessionsStore {
  private readonly getSessionsUseCase = inject(GetUserSessionsUseCase);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<UserSession>>(emptyPage<UserSession>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly sessions = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.getSessionsUseCase.execute(request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }
}
