export interface PlatformFeeResponse {
  commissionAmount: number;
  taxPercent: number;
  providerFeePercent: number;
  currencyCode: string;
}

export interface ChangePlatformFeeRequest {
  commissionAmount: number;
  taxPercent: number;
  providerFeePercent: number;
}
