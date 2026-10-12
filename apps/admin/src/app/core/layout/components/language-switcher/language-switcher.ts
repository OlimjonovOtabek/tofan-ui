import { Component, computed, inject, input } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Menu } from '@openng/optimus-ui/menu';
import { APP_LOCALES, LOCALE_NAMES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export type LanguageSwitcherVariant = 'topbar' | 'floating';

@Component({
  selector: 'app-language-switcher',
  imports: [Button, Menu, TranslatePipe],
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  private readonly localeStore = inject(LocaleStore);

  readonly variant = input<LanguageSwitcherVariant>('topbar');

  protected readonly currentCode = computed(() => this.localeStore.locale().toUpperCase());
  protected readonly items = computed<MenuItem[]>(() =>
    APP_LOCALES.map((locale) => ({
      label: LOCALE_NAMES[locale],
      icon: locale === this.localeStore.locale() ? 'pi pi-check' : 'pi pi-fw',
      command: () => this.localeStore.setLocale(locale),
    })),
  );
}
