import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';

const NOT_FOUND_STATUS = 404;

@Component({
  selector: 'landing-not-found-page',
  imports: [RouterLink, LandingTranslatePipe],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  private readonly localeStore = inject(LocaleStore);

  protected readonly status = NOT_FOUND_STATUS;
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
}
