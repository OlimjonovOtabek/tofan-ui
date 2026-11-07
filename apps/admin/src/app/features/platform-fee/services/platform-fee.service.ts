import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PlatformFee } from '../models/platform-fee';
import { PlatformFeeDraft } from '../models/platform-fee-draft';
import { PlatformFeeResponse } from './platform-fee.dto';
import { toChangePlatformFeeRequest, toPlatformFee } from './platform-fee.mapper';

const PLATFORM_FEE = '/admin/platform-fee';

@Injectable({ providedIn: 'root' })
export class PlatformFeeService {
  private readonly apiClient = inject(ApiClient);

  async get(): Promise<PlatformFee> {
    return toPlatformFee(await this.apiClient.get<PlatformFeeResponse>(PLATFORM_FEE));
  }

  async update(draft: PlatformFeeDraft): Promise<void> {
    await this.apiClient.put(PLATFORM_FEE, toChangePlatformFeeRequest(draft));
  }
}
