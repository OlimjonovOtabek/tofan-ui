import { LandingKey } from '@landing/core/i18n/landing-dictionary';

export const SITE_SECTIONS = {
  features: 'features',
  apparel: 'apparel',
  coaches: 'coaches',
  faq: 'faq',
  download: 'download',
} as const;

export type SiteSection = (typeof SITE_SECTIONS)[keyof typeof SITE_SECTIONS];

export interface SectionLink {
  readonly section: SiteSection;
  readonly label: LandingKey;
}

export const NAV_LINKS: readonly SectionLink[] = [
  { section: SITE_SECTIONS.features, label: 'nav.features' },
  { section: SITE_SECTIONS.apparel, label: 'nav.apparel' },
  { section: SITE_SECTIONS.coaches, label: 'nav.coaches' },
  { section: SITE_SECTIONS.faq, label: 'nav.faq' },
];
