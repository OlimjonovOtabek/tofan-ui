import { Component, computed, inject, input } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Menu } from '@openng/optimus-ui/menu';
import { APP_LOCALES, AppLocale, LOCALE_NAMES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export type LanguageSwitcherVariant = 'segmented' | 'floating';

interface LocaleOption {
  readonly locale: AppLocale;
  readonly code: string;
  readonly name: string;
  readonly active: boolean;
}

@Component({
  selector: 'app-language-switcher',
  imports: [Button, Menu, TranslatePipe],
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  private readonly localeStore = inject(LocaleStore);

  readonly variant = input<LanguageSwitcherVariant>('segmented');

  protected readonly currentCode = computed(() => this.localeStore.locale().toUpperCase());
  protected readonly options = computed<LocaleOption[]>(() =>
    APP_LOCALES.map((locale) => ({
      locale,
      code: locale.toUpperCase(),
      name: LOCALE_NAMES[locale],
      active: locale === this.localeStore.locale(),
    })),
  );
  protected readonly items = computed<MenuItem[]>(() =>
    this.options().map((option) => ({
      label: option.name,
      icon: option.active ? 'pi pi-check' : 'pi pi-fw',
      command: () => this.select(option.locale),
    })),
  );

  protected select(locale: AppLocale): void {
    this.localeStore.setLocale(locale);
  }
}
