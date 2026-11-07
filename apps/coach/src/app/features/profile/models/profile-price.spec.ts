import { formatCount } from '@coach/core/format/formats';
import { AppLocale } from '@core/i18n/locale';
import { translate } from '@core/i18n/translate';
import {
  isVipPriceInputValid,
  priceInputOf,
  profilePriceLabel,
  vipPriceOfInput,
} from './profile-price';

const NBSP = ' ';

function labelOf(
  monthlyPrice: number | null,
  vipMonthlyPrice: number | null,
  locale: AppLocale = 'uz',
): string {
  return profilePriceLabel(
    { monthlyPrice, vipMonthlyPrice },
    (price) => formatCount(price, locale),
    (key, params) => translate(locale, key, params),
  );
}

describe('profile price label', () => {
  it('should say the price is not set when the monthly price is missing', () => {
    expect(labelOf(null, null)).toBe('Narx belgilanmagan');
  });

  it('should show only the monthly price when the coach does not sell VIP', () => {
    expect(labelOf(200000, null)).toBe(`200${NBSP}000 UZS / oy`);
  });

  it('should append the VIP price in the same format when the coach sells VIP', () => {
    expect(labelOf(200000, 400000)).toBe(`200${NBSP}000 UZS / oy · VIP 400${NBSP}000`);
  });

  it('should use the language of the app when the coach sells VIP', () => {
    expect(labelOf(450000, 800000, 'en')).toBe('450,000 UZS / month · VIP 800,000');
    expect(labelOf(450000, 800000, 'ru')).toContain('· VIP');
  });
});

describe('VIP price input', () => {
  it('should treat an empty field as no VIP price when the input is blank', () => {
    expect(vipPriceOfInput('')).toBeNull();
    expect(vipPriceOfInput('   ')).toBeNull();
    expect(isVipPriceInputValid('')).toBe(true);
  });

  it('should read the digits as the VIP price when the input has a number', () => {
    expect(vipPriceOfInput('400000')).toBe(400000);
    expect(isVipPriceInputValid('400000')).toBe(true);
  });

  it('should reject a VIP price of zero when the input is zero', () => {
    expect(isVipPriceInputValid('0')).toBe(false);
    expect(isVipPriceInputValid('000')).toBe(false);
  });
});

describe('price input', () => {
  it('should show a stored price as whole digits when the price is set and as empty when it is missing', () => {
    expect(priceInputOf(400000)).toBe('400000');
    expect(priceInputOf(199999.6)).toBe('200000');
    expect(priceInputOf(null)).toBe('');
  });
});
