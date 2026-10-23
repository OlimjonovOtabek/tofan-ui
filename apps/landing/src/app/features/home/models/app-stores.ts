import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { EXTERNAL_LINKS, ExternalLink } from '@landing/core/config/external-links';
import { IconName } from '@landing/shared/icon/icon-name';

export interface AppStore {
  readonly name: LandingKey;
  readonly icon: IconName;
  readonly href: ExternalLink;
}

export const APP_STORES: readonly AppStore[] = [
  { name: 'store.appStore', icon: 'apple', href: EXTERNAL_LINKS.appStore },
  { name: 'store.googlePlay', icon: 'play', href: EXTERNAL_LINKS.googlePlay },
];
