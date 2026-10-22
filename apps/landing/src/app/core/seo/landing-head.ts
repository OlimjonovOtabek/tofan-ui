import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_LOCALES, AppLocale, DEFAULT_LOCALE } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { translateLanding } from '@landing/core/i18n/landing-translate';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { SITE_ORIGIN } from './site-origin';

const OPEN_GRAPH_LOCALES: Record<AppLocale, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_GB',
};
const DEFAULT_HREFLANG = 'x-default';
const NO_INDEX = 'noindex';
const SITE_NAME = 'Tofan';
const MANAGED_LINKS = 'link[rel="canonical"], link[rel="alternate"][hreflang]';

@Injectable({ providedIn: 'root' })
export class LandingHead {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly localeStore = inject(LocaleStore);

  showHome(): void {
    const locale = this.localeStore.locale();
    const title = translateLanding(locale, 'meta.title');
    const description = translateLanding(locale, 'meta.description');
    const url = absoluteHomeUrl(locale);
    this.title.setTitle(title);
    this.meta.removeTag('name="robots"');
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: OPEN_GRAPH_LOCALES[locale] });
    this.replaceLinks([
      { rel: 'canonical', href: url },
      ...APP_LOCALES.map((alternate) => alternateLink(alternate, alternate)),
      alternateLink(DEFAULT_HREFLANG, DEFAULT_LOCALE),
    ]);
  }

  showNotFound(): void {
    this.title.setTitle(translateLanding(this.localeStore.locale(), 'meta.notFoundTitle'));
    this.meta.updateTag({ name: 'robots', content: NO_INDEX });
    this.replaceLinks([]);
  }

  private replaceLinks(links: readonly HeadLink[]): void {
    const head = this.document.head;
    head.querySelectorAll(MANAGED_LINKS).forEach((link) => link.remove());
    for (const { rel, href, hreflang } of links) {
      const link = this.document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (hreflang) {
        link.hreflang = hreflang;
      }
      head.appendChild(link);
    }
  }
}

interface HeadLink {
  readonly rel: string;
  readonly href: string;
  readonly hreflang?: string;
}

function absoluteHomeUrl(locale: AppLocale): string {
  return `${SITE_ORIGIN}${localeHomeUrl(locale)}`;
}

function alternateLink(hreflang: string, locale: AppLocale): HeadLink {
  return { rel: 'alternate', hreflang, href: absoluteHomeUrl(locale) };
}
