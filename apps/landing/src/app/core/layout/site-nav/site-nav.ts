import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { NAV_LINKS, SITE_SECTIONS } from '@landing/core/config/site-sections';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { BrandLogo } from '../brand-logo/brand-logo';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'landing-site-nav',
  imports: [RouterLink, LandingTranslatePipe, Icon, BrandLogo, LanguageSwitcher],
  templateUrl: './site-nav.html',
  styleUrl: './site-nav.css',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class SiteNav {
  private readonly localeStore = inject(LocaleStore);

  protected readonly links = NAV_LINKS;
  protected readonly downloadSection = SITE_SECTIONS.download;
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
