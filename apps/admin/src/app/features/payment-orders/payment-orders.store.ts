import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { PaymentOrder } from './models/payment-order';
import { PaymentOrderFilter } from './models/payment-order-filter';
import { PaymentOrdersService } from './services/payment-orders.service';

@Injectable()
export class PaymentOrdersStore {
  private readonly paymentOrdersService = inject(PaymentOrdersService);

  private readonly page = signal<Page<PaymentOrder>>(emptyPage<PaymentOrder>());
  private readonly currentFilter = signal<PaymentOrderFilter>({});
  private readonly currentRequest = signal<PageRequest | null>(null);

  readonly orders = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly first = computed(() => this.currentRequest()?.first ?? 0);

  private latestLoad = 0;

  async load(request: PageRequest = this.currentRequest() ?? firstPage()): Promise<void> {
    const loadNumber = ++this.latestLoad;
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const page = await this.paymentOrdersService.list(this.currentFilter(), request);
      if (loadNumber === this.latestLoad) {
        this.page.set(page);
      }
    } catch (error) {
      if (loadNumber === this.latestLoad) {
        this.page.set(emptyPage<PaymentOrder>());
        this.loadError.set(toErrorMessage(error));
      }
    } finally {
      if (loadNumber === this.latestLoad) {
        this.loading.set(false);
      }
    }
  }

  async applyFilter(filter: PaymentOrderFilter): Promise<void> {
    this.currentFilter.set(filter);
    const request = this.currentRequest();
    if (request === null) {
      return;
    }
    await this.load({ ...request, ...firstPage(request.rows || DEFAULT_PAGE_SIZE) });
  }
}
