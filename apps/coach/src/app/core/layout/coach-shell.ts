import { Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button, ButtonDirective, ButtonLabel } from '@openng/optimus-ui/button';
import { Menu } from '@openng/optimus-ui/menu';
import { MenuItem } from '@openng/optimus-ui/api';
import { Avatar } from '@openng/optimus-ui/avatar';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { APP_LOCALES, LOCALE_NAMES } from '@core/i18n/locale';
import { Logo } from '@shared/components/logo/logo';

interface CoachNavItem {
  path: string;
  label: TranslationKey;
  icon: string;
}

@Component({
  selector: 'coach-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslatePipe,
    Button,
    ButtonDirective,
    ButtonLabel,
    Menu,
    Avatar,
    Logo,
  ],
  templateUrl: './coach-shell.html',
  styleUrl: './coach-shell.css',
})
export class CoachShell {
  private readonly document = inject(DOCUMENT);
  protected readonly auth = inject(AuthStore);
  protected readonly locale = inject(LocaleStore);
  protected readonly darkMode = signal(
    this.document.documentElement.classList.contains('app-dark'),
  );
  protected readonly languageMenuOpen = signal(false);
  protected readonly languageCode = computed(() => this.locale.locale().toUpperCase());
  protected readonly languageName = computed(() => LOCALE_NAMES[this.locale.locale()]);
  protected readonly languages = computed<MenuItem[]>(() =>
    APP_LOCALES.map((locale) => ({
      label: LOCALE_NAMES[locale],
      icon: locale === this.locale.locale() ? 'pi pi-check' : 'pi pi-fw',
      command: () => this.locale.setLocale(locale),
    })),
  );
  protected readonly navigation: readonly CoachNavItem[] = [
    { path: '/programs', label: 'coach.navigation.programs', icon: 'pi pi-book' },
    { path: '/clients', label: 'coach.navigation.clients', icon: 'pi pi-users' },
    { path: '/content', label: 'coach.navigation.content', icon: 'pi pi-folder' },
    { path: '/profile', label: 'coach.navigation.profile', icon: 'pi pi-user' },
  ];

  protected toggleTheme(): void {
    this.darkMode.update((dark) => !dark);
    this.document.documentElement.classList.toggle('app-dark', this.darkMode());
  }

  protected signOut(): void {
    void this.auth.logout();
  }
}
