import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '@landing/core/config/footer-links';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { BrandLogo } from '../brand-logo/brand-logo';

@Component({
  selector: 'landing-site-footer',
  imports: [RouterLink, LandingTranslatePipe, Icon, BrandLogo],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  private readonly localeStore = inject(LocaleStore);

  protected readonly columns = FOOTER_COLUMNS;
  protected readonly socials = SOCIAL_LINKS;
  protected readonly year = new Date().getFullYear();
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
}
