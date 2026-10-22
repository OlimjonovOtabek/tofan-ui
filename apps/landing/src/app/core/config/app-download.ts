import { EXTERNAL_LINKS } from './external-links';

export const APP_DOWNLOAD_PATH = '/app';

const APPLE_MOBILE_DEVICE = /iPhone|iPad|iPod/i;

export function appStoreUrlFor(userAgent: string | undefined): string {
  return APPLE_MOBILE_DEVICE.test(userAgent ?? '')
    ? EXTERNAL_LINKS.appStore
    : EXTERNAL_LINKS.googlePlay;
}
