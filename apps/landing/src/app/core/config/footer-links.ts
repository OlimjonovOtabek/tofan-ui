import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { EXTERNAL_LINKS, ExternalLink } from './external-links';
import { SITE_SECTIONS, SiteSection } from './site-sections';

export type FooterLink =
  | { readonly kind: 'section'; readonly label: LandingKey; readonly section: SiteSection }
  | { readonly kind: 'external'; readonly label: LandingKey; readonly href: ExternalLink };

export interface FooterColumn {
  readonly title: LandingKey;
  readonly links: readonly FooterLink[];
}

export interface SocialLink {
  readonly label: LandingKey;
  readonly icon: 'send' | 'insta' | 'yt';
  readonly href: ExternalLink;
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'footer.product',
    links: [
      { kind: 'section', label: 'nav.features', section: SITE_SECTIONS.features },
      { kind: 'section', label: 'nav.apparel', section: SITE_SECTIONS.apparel },
    ],
  },
  {
    title: 'footer.partnership',
    links: [
      { kind: 'section', label: 'nav.coaches', section: SITE_SECTIONS.coaches },
      { kind: 'external', label: 'footer.investors', href: EXTERNAL_LINKS.adminTelegram },
      { kind: 'external', label: 'footer.contactAdmin', href: EXTERNAL_LINKS.adminTelegram },
    ],
  },
  {
    title: 'footer.legal',
    links: [
      { kind: 'external', label: 'footer.privacy', href: EXTERNAL_LINKS.privacyPolicy },
      { kind: 'external', label: 'footer.terms', href: EXTERNAL_LINKS.termsOfUse },
      { kind: 'external', label: 'footer.refunds', href: EXTERNAL_LINKS.refundPolicy },
    ],
  },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'footer.telegram', icon: 'send', href: EXTERNAL_LINKS.telegram },
  { label: 'footer.instagram', icon: 'insta', href: EXTERNAL_LINKS.instagram },
  { label: 'footer.youtube', icon: 'yt', href: EXTERNAL_LINKS.youtube },
];
