import { TranslationKey } from '@core/i18n/dictionary';
import { TariffType } from './tariff-type';

export const TARIFF_TYPE_LABELS: Record<TariffType, TranslationKey> = {
  free: 'tariffs.type.free',
  standard: 'tariffs.type.standard',
  vip: 'tariffs.type.vip',
};
