import { InjectionToken } from '@angular/core';

export interface PushConfig {
  readonly apiKey: string;
  readonly appId: string;
  readonly projectId: string;
  readonly messagingSenderId: string;
  readonly vapidKey?: string;
}

export const PUSH_CONFIG = new InjectionToken<PushConfig | null>('PUSH_CONFIG', {
  factory: () => null,
});
