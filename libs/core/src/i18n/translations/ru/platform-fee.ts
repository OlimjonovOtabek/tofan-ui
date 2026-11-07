import { Dictionary } from '../../dictionary';

export const PLATFORM_FEE_RU: Dictionary['platformFee'] = {
  title: 'Platform fee',
  subtitle:
    'Комиссия, налог и процент платёжного провайдера, которые Tofan добавляет к цене каждого платежа.',
  loading: 'Загрузка...',
  form: {
    commissionAmount: 'Сумма комиссии',
    commissionHint:
      'Фиксированная сумма, добавляемая к каждому платежу. Не меньше 0, не более 2 знаков после запятой.',
    taxPercent: 'Процент налога',
    taxHint: 'От 0 до 100, не более 2 знаков после запятой (например, 12).',
    providerFeePercent: 'Процент платёжного провайдера',
    providerFeeHint: 'От 0 до 100, не более 2 знаков после запятой (например, 2,5).',
    percentSuffix: '%',
    futureOnly:
      'Изменение влияет только на платежи, открытые после сохранения. Прошлые платежи не меняются.',
  },
  errors: {
    commissionAmount: 'Введите число не меньше 0, не более 2 знаков после запятой.',
    percent: 'Введите число от 0 до 100, не более 2 знаков после запятой.',
  },
  confirm: {
    header: 'Изменение Platform fee',
    message:
      'Изменить Platform fee? Новые значения применятся к ценам только со следующих платежей.',
  },
  toast: {
    saved: 'Platform fee сохранён.',
  },
};
