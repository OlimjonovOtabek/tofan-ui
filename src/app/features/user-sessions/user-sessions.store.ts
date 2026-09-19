import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { UserSession } from './models/user-session';
import { UserSessionFilter } from './models/user-session-filter';
import { UserSessionsService } from './services/user-sessions.service';
import { toErrorMessage } from '@core/feedback/error-message';

@Injectable()
export class UserSessionsStore {
  private readonly userSessionsService = inject(UserSessionsService);

  private readonly page = signal<Page<UserSession>>(emptyPage<UserSession>());
  private readonly currentFilter = signal<UserSessionFilter>({});
  private readonly currentRequest = signal<PageRequest | null>(null);

  readonly sessions = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly first = computed(() => this.currentRequest()?.first ?? 0);
  readonly userId = computed(() => this.currentFilter().userId ?? null);

  async load(request: PageRequest = this.currentRequest() ?? firstPage()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.userSessionsService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<UserSession>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async filterByUser(userId: string | null): Promise<void> {
    if (userId === this.userId()) {
      return;
    }
    this.currentFilter.set(userId === null ? {} : { userId });
    const request = this.currentRequest();
    if (request === null) {
      return;
    }
    await this.load({ ...request, ...firstPage(request.rows || DEFAULT_PAGE_SIZE) });
  }
}
