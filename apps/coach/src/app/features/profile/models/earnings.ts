import { Payment } from '@coach/core/payments/payment';

export const EARNINGS_PERIODS = ['thisMonth', 'lastMonth', 'thisYear'] as const;
export type EarningsPeriod = (typeof EARNINGS_PERIODS)[number];
export const EARNINGS_PAGE_SIZE = 20;

export interface EarningsSummary {
  readonly currencyCode: string | null;
  readonly paymentCount: number;
  readonly netAmount: number;
  readonly refundCount: number;
  readonly refundedAmount: number;
}

export interface Earnings {
  readonly period: EarningsPeriod;
  readonly summary: EarningsSummary;
  readonly payments: readonly Payment[];
  readonly totalCount: number;
}

export function hasMore(earnings: Earnings): boolean {
  return earnings.payments.length < earnings.totalCount;
}

export function periodRange(period: EarningsPeriod, today: Date): { from: Date; to: Date } {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  switch (period) {
    case 'thisMonth':
      return { from: new Date(day.getFullYear(), day.getMonth(), 1), to: day };
    case 'lastMonth':
      return {
        from: new Date(day.getFullYear(), day.getMonth() - 1, 1),
        to: new Date(day.getFullYear(), day.getMonth(), 0),
      };
    case 'thisYear':
      return { from: new Date(day.getFullYear(), 0, 1), to: day };
  }
}
