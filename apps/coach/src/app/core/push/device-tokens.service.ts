import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';

const DEVICE_TOKENS = '/device-tokens/me';
const WEB_PLATFORM = 3;
const DEVICE_NAME = 'Tofan Coach Web';

@Injectable({ providedIn: 'root' })
export class DeviceTokensService {
  private readonly api = inject(ApiClient);

  async register(token: string): Promise<void> {
    await this.api.put(DEVICE_TOKENS, {
      token,
      deviceName: DEVICE_NAME,
      platform: WEB_PLATFORM,
    });
  }

  async unregister(token: string): Promise<void> {
    await this.api.delete(DEVICE_TOKENS, { token });
  }
}
