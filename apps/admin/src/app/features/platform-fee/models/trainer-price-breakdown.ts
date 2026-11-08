import { PlatformFeeDraft } from './platform-fee-draft';

export const SAMPLE_TRAINER_PRICE = 200000;

const CENTS_PER_UNIT = 100;
const BASIS_POINTS_PER_PERCENT = 100;
const PERCENT_SCALE = 100;
const SCALED_UNIT = CENTS_PER_UNIT * BASIS_POINTS_PER_PERCENT * PERCENT_SCALE;

export interface TrainerPriceBreakdown {
  readonly price: number;
  readonly commission: number;
  readonly tax: number;
  readonly providerFee: number;
  readonly total: number;
}

export function trainerPriceBreakdown(price: number, fee: PlatformFeeDraft): TrainerPriceBreakdown {
  const commission = fee.commissionAmount;
  const tax = roundedPercentOf(toCents(price) + toCents(commission), fee.taxPercent);
  const providerFee = roundedPercentOf(
    toCents(price) + toCents(commission) + toCents(tax),
    fee.providerFeePercent,
  );
  const totalCents = toCents(price) + toCents(commission) + toCents(tax) + toCents(providerFee);
  return { price, commission, tax, providerFee, total: totalCents / CENTS_PER_UNIT };
}

function roundedPercentOf(baseCents: number, percent: number): number {
  const scaled = baseCents * Math.round(percent * BASIS_POINTS_PER_PERCENT);
  return Math.floor((scaled + SCALED_UNIT / 2) / SCALED_UNIT);
}

function toCents(amount: number): number {
  return Math.round(amount * CENTS_PER_UNIT);
}
