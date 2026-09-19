import { Injectable, computed, inject, signal } from '@angular/core';
import { toErrorMessage } from '@core/feedback/error-message';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { SoldierFilter } from './models/soldier-filter';
import { SoldierSummary } from './models/soldier-summary';
import { SoldiersService } from './services/soldiers.service';

@Injectable()
export class SoldiersStore {
  private readonly soldiersService = inject(SoldiersService);

  private readonly page = signal<Page<SoldierSummary>>(emptyPage<SoldierSummary>());
  private readonly currentFilter = signal<SoldierFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly soldiers = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.soldiersService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<SoldierSummary>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilter(filter: SoldierFilter): Promise<void> {
    this.currentFilter.set(filter);
    const { rows, sortField, sortDirection } = this.currentRequest();
    await this.load({ ...firstPage(rows || DEFAULT_PAGE_SIZE), sortField, sortDirection });
  }
}
