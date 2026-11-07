import { Dictionary } from '../../dictionary';

export const PAYMENT_ORDERS_RU: Dictionary['paymentOrders'] = {
  title: 'Платёжные заказы',
  total: 'Всего заказов: {count}',
  empty: 'По этому фильтру заказов нет.',
  soldierCard: 'Карточка Soldier',
  money: '{amount} сум',
  percent: '{value}%',
  purposeWithTier: '{purpose} · {tier}',
  paidAt: 'Оплачен: {date}',
  paidWith: 'Оплачен: {date}, {provider}',
  refundedAt: 'Возвращён: {date}',
  columns: {
    created: 'Создан',
    user: 'ID пользователя',
    purpose: 'За что',
    price: 'Цена',
    commission: 'Комиссия',
    tax: 'Налог',
    providerFee: 'Провайдер',
    amount: 'Итого',
    status: 'Статус',
  },
  purpose: {
    trainerSubscription: 'Подписка на тренера',
    tariff: 'Тариф Tofan',
  },
  status: {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    refunded: 'Возвращён',
  },
  provider: {
    payme: 'Payme',
    click: 'Click',
  },
  filters: {
    status: 'Статус',
    all: 'Все',
    userId: 'ID пользователя',
    referenceId: 'ID тренера или тарифа',
    idInvalid: 'Введите полный UUID.',
    idPlaceholder: 'UUID',
  },
};
