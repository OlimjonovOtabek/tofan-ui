import { Injectable, computed, inject, signal } from '@angular/core';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { UserSession } from './models/user-session';
import { UserSessionsService } from './services/user-sessions.service';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class UserSessionsStore {
  private readonly userSessionsService = inject(UserSessionsService);
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
      this.page.set(await this.userSessionsService.list(request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }
}
