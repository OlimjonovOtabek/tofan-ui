import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { PaymentOrdersPage } from './pages/payment-orders-page/payment-orders-page';

export const PAYMENT_ORDER_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.paymentOrders'), component: PaymentOrdersPage },
];
