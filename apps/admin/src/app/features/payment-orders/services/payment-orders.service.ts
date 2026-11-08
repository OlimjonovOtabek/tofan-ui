import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { Page, PageRequest } from '@shared/models/page';
import { PaymentOrder } from '../models/payment-order';
import { PaymentOrderDraft } from '../models/payment-order-draft';
import { PaymentOrderFilter } from '../models/payment-order-filter';
import { PaymentOrderResponse } from './payment-order.dto';
import {
  toCreatePaymentOrderRequest,
  toPaymentOrder,
  toPaymentOrderStatusDto,
} from './payment-order.mapper';

const PAYMENT_ORDERS = '/admin/payment-orders';

@Injectable({ providedIn: 'root' })
export class PaymentOrdersService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: PaymentOrderFilter, page: PageRequest): Promise<Page<PaymentOrder>> {
    const list = await this.apiClient.get<PagedList<PaymentOrderResponse>>(PAYMENT_ORDERS, {
      ...toPagedQuery(page),
      Status: filter.status === undefined ? undefined : toPaymentOrderStatusDto(filter.status),
      UserId: filter.userId,
      ReferenceId: filter.referenceId,
    });
    return toPage(list, toPaymentOrder);
  }

  create(draft: PaymentOrderDraft): Promise<string> {
    return this.apiClient.post<string>(PAYMENT_ORDERS, toCreatePaymentOrderRequest(draft));
  }
}
