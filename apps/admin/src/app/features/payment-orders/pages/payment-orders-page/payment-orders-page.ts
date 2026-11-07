import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { formatDateTime } from '@core/i18n/date-format';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Tag } from '@openng/optimus-ui/tag';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { TIER_LABELS } from '@shared/models/tier-labels';
import { PaymentOrderFilters } from '../../components/payment-order-filters/payment-order-filters';
import { PaymentOrder } from '../../models/payment-order';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import {
  PAYMENT_ORDER_STATUS_LABELS,
  PAYMENT_ORDER_STATUS_SEVERITIES,
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PaymentOrderTagSeverity,
} from '../../models/payment-order-labels';
import { PaymentOrdersStore } from '../../payment-orders.store';

const MONEY_FRACTION_DIGITS = 2;

interface PaymentOrderRow {
  readonly id: string;
  readonly userId: string;
  readonly referenceId: string;
  readonly createdAt: string;
  readonly purpose: string;
  readonly price: string;
  readonly commission: string;
  readonly tax: string;
  readonly taxPercent: string;
  readonly providerFee: string;
  readonly providerFeePercent: string;
  readonly amount: string;
  readonly statusLabel: string;
  readonly statusSeverity: PaymentOrderTagSeverity;
  readonly statusHint: string | null;
}

@Component({
  selector: 'app-payment-orders-page',
  imports: [CatalogHeader, DataTable, PaymentOrderFilters, RouterLink, Tag, TranslatePipe],
  providers: [PaymentOrdersStore],
  templateUrl: './payment-orders-page.html',
})
export class PaymentOrdersPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(PaymentOrdersStore);
  protected readonly soldiersPath = AppPaths.soldiers;

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'createdOnUtc', header: this.text('paymentOrders.columns.created'), sortable: true },
    { field: 'userId', header: this.text('paymentOrders.columns.user') },
    { field: 'purpose', header: this.text('paymentOrders.columns.purpose') },
    { field: 'price', header: this.text('paymentOrders.columns.price'), sortable: true },
    {
      field: 'commissionAmount',
      header: this.text('paymentOrders.columns.commission'),
      sortable: true,
    },
    { field: 'taxAmount', header: this.text('paymentOrders.columns.tax'), sortable: true },
    {
      field: 'providerFeeAmount',
      header: this.text('paymentOrders.columns.providerFee'),
      sortable: true,
    },
    { field: 'amount', header: this.text('paymentOrders.columns.amount'), sortable: true },
    { field: 'status', header: this.text('paymentOrders.columns.status') },
  ]);

  private readonly numbers = computed(
    () =>
      new Intl.NumberFormat(INTL_LOCALES[this.localeStore.locale()], {
        maximumFractionDigits: MONEY_FRACTION_DIGITS,
      }),
  );

  protected readonly rows = computed<readonly PaymentOrderRow[]>(() =>
    this.store.orders().map((order) => this.toRow(order)),
  );

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: PaymentOrderFilter): void {
    void this.store.applyFilter(filter);
  }

  private toRow(order: PaymentOrder): PaymentOrderRow {
    return {
      id: order.id,
      userId: order.userId,
      referenceId: order.referenceId,
      createdAt: this.date(order.createdAt),
      purpose: this.purposeLabel(order),
      price: this.money(order.price),
      commission: this.money(order.commissionAmount),
      tax: this.money(order.taxAmount),
      taxPercent: this.percent(order.taxPercent),
      providerFee: this.money(order.providerFeeAmount),
      providerFeePercent: this.percent(order.providerFeePercent),
      amount: this.money(order.amount),
      statusLabel: this.text(PAYMENT_ORDER_STATUS_LABELS[order.status]),
      statusSeverity: PAYMENT_ORDER_STATUS_SEVERITIES[order.status],
      statusHint: this.statusHint(order),
    };
  }

  private purposeLabel(order: PaymentOrder): string {
    const purpose = this.text(PAYMENT_PURPOSE_LABELS[order.purpose]);
    return order.tier === null
      ? purpose
      : this.translate('paymentOrders.purposeWithTier', {
          purpose,
          tier: this.text(TIER_LABELS[order.tier]),
        });
  }

  private statusHint(order: PaymentOrder): string | null {
    if (order.refundedAt !== null) {
      return this.translate('paymentOrders.refundedAt', { date: this.date(order.refundedAt) });
    }
    if (order.paidAt === null) {
      return null;
    }
    const date = this.date(order.paidAt);
    return order.paidWith === null
      ? this.translate('paymentOrders.paidAt', { date })
      : this.translate('paymentOrders.paidWith', {
          date,
          provider: this.text(PAYMENT_PROVIDER_LABELS[order.paidWith]),
        });
  }

  private money(amount: number): string {
    return this.translate('paymentOrders.money', { amount: this.numbers().format(amount) });
  }

  private percent(value: number): string {
    return this.translate('paymentOrders.percent', { value: this.numbers().format(value) });
  }

  private date(date: Date): string {
    return formatDateTime(date, this.localeStore.locale());
  }

  private translate(key: TranslationKey, params: TranslationParams): string {
    return this.translator.translate(key, params);
  }

  private text(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
