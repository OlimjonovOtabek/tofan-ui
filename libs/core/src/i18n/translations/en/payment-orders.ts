import { Dictionary } from '../../dictionary';

export const PAYMENT_ORDERS_EN: Dictionary['paymentOrders'] = {
  title: 'Payment orders',
  total: '{count} orders in total',
  empty: 'No orders match this filter.',
  soldierCard: 'Soldier card',
  money: '{amount} UZS',
  percent: '{value}%',
  purposeWithTier: '{purpose} · {tier}',
  paidAt: 'Paid: {date}',
  paidWith: 'Paid: {date}, {provider}',
  refundedAt: 'Refunded: {date}',
  columns: {
    created: 'Created',
    user: 'User ID',
    purpose: 'For',
    price: 'Price',
    commission: 'Commission',
    tax: 'Tax',
    providerFee: 'Provider',
    amount: 'Total',
    status: 'Status',
  },
  purpose: {
    trainerSubscription: 'Trainer subscription',
    tariff: 'Tofan tariff',
  },
  status: {
    pending: 'Pending',
    paid: 'Paid',
    refunded: 'Refunded',
  },
  provider: {
    payme: 'Payme',
    click: 'Click',
  },
  filters: {
    status: 'Status',
    all: 'All',
    userId: 'User ID',
    referenceId: 'Trainer or tariff ID',
    idInvalid: 'Enter a full UUID.',
  },
};
