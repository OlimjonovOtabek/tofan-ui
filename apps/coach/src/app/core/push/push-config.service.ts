import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PUSH_CONFIG_PATH, PushConfig, toPushConfig } from './push-config';

@Injectable({ providedIn: 'root' })
export class PushConfigService {
  private readonly http = inject(HttpClient);
  private config: Promise<PushConfig | null> | null = null;

  load(): Promise<PushConfig | null> {
    this.config ??= firstValueFrom(this.http.get<unknown>(PUSH_CONFIG_PATH)).then(
      toPushConfig,
      hidePushWhenConfigIsMissing,
    );
    return this.config;
  }
}

function hidePushWhenConfigIsMissing(): null {
  return null;
}
