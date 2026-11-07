export interface PlatformFee {
  readonly commissionAmount: number;
  readonly taxPercent: number;
  readonly providerFeePercent: number;
  readonly currencyCode: string;
}
