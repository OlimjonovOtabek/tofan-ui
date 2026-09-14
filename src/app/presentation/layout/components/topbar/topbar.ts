import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@presentation/auth/auth.store';
import { AppPaths } from '@presentation/routing/app-paths';
import { Logo } from '@presentation/shared/components/logo/logo';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';
import { LayoutService } from '../../layout.service';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, Menu, Logo, ThemeSwitcher],
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly layoutService = inject(LayoutService);
  private readonly authStore = inject(AuthStore);

  protected readonly dashboardPath = AppPaths.dashboard;

  protected readonly profileMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.authStore.displayName(),
      items: [
        {
          label: 'Chiqish',
          icon: 'pi pi-sign-out',
          command: () => void this.authStore.logout(),
        },
      ],
    },
  ]);
}
