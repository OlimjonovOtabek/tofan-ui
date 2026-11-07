export const TARIFF_TYPES = ['free', 'standard', 'vip'] as const;
export type TariffType = (typeof TARIFF_TYPES)[number];

export function isFreeTariff(type: TariffType): boolean {
  return type === 'free';
}

export function compareTariffTypes(left: TariffType, right: TariffType): number {
  return TARIFF_TYPES.indexOf(left) - TARIFF_TYPES.indexOf(right);
}
