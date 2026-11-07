import { PlatformFee } from '../models/platform-fee';
import { PlatformFeeDraft } from '../models/platform-fee-draft';
import { ChangePlatformFeeRequest, PlatformFeeResponse } from './platform-fee.dto';

export function toPlatformFee(response: PlatformFeeResponse): PlatformFee {
  return {
    commissionAmount: response.commissionAmount,
    taxPercent: response.taxPercent,
    providerFeePercent: response.providerFeePercent,
    currencyCode: response.currencyCode,
  };
}

export function toChangePlatformFeeRequest(draft: PlatformFeeDraft): ChangePlatformFeeRequest {
  return {
    commissionAmount: draft.commissionAmount,
    taxPercent: draft.taxPercent,
    providerFeePercent: draft.providerFeePercent,
  };
}
