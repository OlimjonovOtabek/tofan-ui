export const PUSH_CONFIG_PATH = '/push-config.json';

export interface PushConfig {
  readonly apiKey: string;
  readonly appId: string;
  readonly projectId: string;
  readonly messagingSenderId: string;
  readonly vapidKey?: string;
}

export function toPushConfig(value: unknown): PushConfig | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const fields: Readonly<Record<string, unknown>> = { ...value };
  const { apiKey, appId, projectId, messagingSenderId, vapidKey } = fields;
  if (
    !isFilledText(apiKey) ||
    !isFilledText(appId) ||
    !isFilledText(projectId) ||
    !isFilledText(messagingSenderId)
  ) {
    return null;
  }
  const config = { apiKey, appId, projectId, messagingSenderId };
  return isFilledText(vapidKey) ? { ...config, vapidKey } : config;
}

function isFilledText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
