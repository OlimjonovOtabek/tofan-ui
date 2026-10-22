import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { Icon } from '@landing/shared/icon/icon';
import { PhonePreview } from '../phone-preview/phone-preview';
import { StoreBadges } from '../store-badges/store-badges';

const HERO_PERKS: readonly LandingKey[] = [
  'hero.perks.free',
  'hero.perks.payments',
  'hero.perks.daily',
];

@Component({
  selector: 'landing-hero-section',
  imports: [RouterLink, LandingTranslatePipe, Icon, PhonePreview, StoreBadges],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection {
  private readonly localeStore = inject(LocaleStore);

  protected readonly perks = HERO_PERKS;
  protected readonly coachesSection = SITE_SECTIONS.coaches;
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
}
