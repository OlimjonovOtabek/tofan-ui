import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { APP_LOCALES, AppLocale, LOCALE_NAMES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { Icon } from '@landing/shared/icon/icon';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';

interface LanguageOption {
  readonly locale: AppLocale;
  readonly name: string;
  readonly url: string;
}

const LANGUAGE_OPTIONS: readonly LanguageOption[] = APP_LOCALES.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale],
  url: localeHomeUrl(locale),
}));

@Component({
  selector: 'landing-language-switcher',
  imports: [RouterLink, LandingTranslatePipe, Icon],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
  host: {
    '(document:click)': 'closeWhenOutside($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class LanguageSwitcher {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly locale = inject(LocaleStore).locale;
  protected readonly options = LANGUAGE_OPTIONS;
  protected readonly open = signal(false);
  protected readonly code = computed(() => this.locale().toUpperCase());

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected closeWhenOutside(event: Event): void {
    if (event.target instanceof Node && this.host.nativeElement.contains(event.target)) {
      return;
    }
    this.close();
  }
}
