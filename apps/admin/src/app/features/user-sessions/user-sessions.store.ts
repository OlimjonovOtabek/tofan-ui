import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { UserSession } from './models/user-session';
import { SessionListFilter, UserSessionFilter } from './models/user-session-filter';
import { UserSessionsService } from './services/user-sessions.service';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';

@Injectable()
export class UserSessionsStore {
  private readonly userSessionsService = inject(UserSessionsService);

  private readonly page = signal<Page<UserSession>>(emptyPage<UserSession>());
  private readonly currentUserId = signal<string | null>(null);
  private readonly currentListFilter = signal<SessionListFilter>({});
  private readonly currentRequest = signal<PageRequest | null>(null);
  private readonly currentFilter = computed<UserSessionFilter>(() => {
    const userId = this.currentUserId();
    return userId === null ? this.currentListFilter() : { ...this.currentListFilter(), userId };
  });

  readonly sessions = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly first = computed(() => this.currentRequest()?.first ?? 0);
  readonly userId = this.currentUserId.asReadonly();

  private latestLoad = 0;

  async load(request: PageRequest = this.currentRequest() ?? firstPage()): Promise<void> {
    const loadNumber = ++this.latestLoad;
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const page = await this.userSessionsService.list(this.currentFilter(), request);
      if (loadNumber === this.latestLoad) {
        this.page.set(page);
      }
    } catch (error) {
      if (loadNumber === this.latestLoad) {
        this.page.set(emptyPage<UserSession>());
        this.loadError.set(toErrorMessage(error));
      }
    } finally {
      if (loadNumber === this.latestLoad) {
        this.loading.set(false);
      }
    }
  }

  async filterByUser(userId: string | null): Promise<void> {
    if (userId === this.currentUserId()) {
      return;
    }
    this.currentUserId.set(userId);
    await this.reloadFirstPage();
  }

  async applyFilter(filter: SessionListFilter): Promise<void> {
    this.currentListFilter.set(filter);
    await this.reloadFirstPage();
  }

  private async reloadFirstPage(): Promise<void> {
    const request = this.currentRequest();
    if (request === null) {
      return;
    }
    await this.load({ ...request, ...firstPage(request.rows || DEFAULT_PAGE_SIZE) });
  }
}
