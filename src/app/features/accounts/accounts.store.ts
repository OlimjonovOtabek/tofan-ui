import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { Account } from './models/account';
import { AccountFilter } from './models/account-filter';
import { AccountsService } from './services/accounts.service';

@Injectable()
export class AccountsStore {
  private readonly accountsService = inject(AccountsService);

  private readonly page = signal<Page<Account>>(emptyPage<Account>());
  private readonly currentFilter = signal<AccountFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly accounts = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.accountsService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<Account>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilter(filter: AccountFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }
}
