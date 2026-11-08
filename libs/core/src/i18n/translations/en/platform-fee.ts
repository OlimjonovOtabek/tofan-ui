import { Dictionary } from '../../dictionary';

export const PLATFORM_FEE_EN: Dictionary['platformFee'] = {
  title: 'Platform fee',
  subtitle:
    'The commission, tax and payment provider fee added to a trainer subscription price. Tofan tariffs do not get them.',
  loading: 'Loading...',
  form: {
    commissionAmount: 'Commission amount',
    commissionHint:
      'A fixed amount added to every trainer subscription payment. Not below 0, at most 2 decimals.',
    taxPercent: 'Tax percent',
    taxHint: 'From 0 to 100, at most 2 decimals (for example 12).',
    providerFeePercent: 'Payment provider percent',
    providerFeeHint: 'From 0 to 100, at most 2 decimals (for example 2.5).',
    percentSuffix: '%',
    futureOnly:
      'A change affects only payments opened after you save it. Earlier payments do not change.',
  },
  sample: {
    title: 'Sample calculation',
    hint: 'Uses the values in the form. Tax and provider fee are each rounded to a whole sum.',
    price: 'Trainer price',
    commission: 'Commission',
    tax: 'Tax ({percent}%)',
    providerFee: 'Payment provider ({percent}%)',
    total: 'A Soldier pays',
  },
  errors: {
    commissionAmount: 'Enter a number from 0 up with at most 2 decimals.',
    percent: 'Enter a number from 0 to 100 with at most 2 decimals.',
  },
  confirm: {
    header: 'Change the Platform fee',
    message: 'Change the Platform fee? The new values apply to prices from the next payments only.',
  },
  toast: {
    saved: 'Platform fee saved.',
  },
};
