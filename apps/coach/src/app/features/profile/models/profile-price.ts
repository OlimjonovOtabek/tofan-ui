import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';

const PRICE_SEPARATOR = ' · ';

export type PriceTranslate = (key: TranslationKey, params?: TranslationParams) => string;

export function profilePriceLabel(
  profile: Pick<CoachProfile, 'monthlyPrice' | 'vipMonthlyPrice'>,
  format: (price: number) => string,
  translate: PriceTranslate,
): string {
  if (profile.monthlyPrice === null) {
    return translate('coachApp.profile.priceUnset');
  }
  const standard = `${format(profile.monthlyPrice)} ${translate('coachApp.profile.priceUnit')}`;
  if (profile.vipMonthlyPrice === null) {
    return standard;
  }
  const vip = translate('coachApp.profile.vipPrice', { price: format(profile.vipMonthlyPrice) });
  return `${standard}${PRICE_SEPARATOR}${vip}`;
}

export function priceInputOf(price: number | null): string {
  return price === null ? '' : String(Math.round(price));
}

export function vipPriceOfInput(input: string): number | null {
  const digits = input.trim();
  return digits === '' ? null : Number(digits);
}

export function isVipPriceInputValid(input: string): boolean {
  const price = vipPriceOfInput(input);
  return price === null || price > 0;
}
