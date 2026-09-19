import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { AppPaths } from '@core/config/app-paths';
import { Logo } from '@shared/components/logo/logo';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';
import { LayoutService } from '@core/layout/layout.service';
import { ThemeSwitcher } from '@core/layout/components/theme-switcher/theme-switcher';
import { LanguageSwitcher } from '@core/layout/components/language-switcher/language-switcher';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, Menu, Logo, ThemeSwitcher, LanguageSwitcher, TranslatePipe],
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly layoutService = inject(LayoutService);
  private readonly authStore = inject(AuthStore);
  private readonly translator = inject(Translator);

  protected readonly dashboardPath = AppPaths.dashboard;

  protected readonly profileMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.authStore.displayName(),
      items: [
        {
          label: this.translator.translate('layout.topbar.logout'),
          icon: 'pi pi-sign-out',
          command: () => void this.authStore.logout(),
        },
      ],
    },
  ]);
}
