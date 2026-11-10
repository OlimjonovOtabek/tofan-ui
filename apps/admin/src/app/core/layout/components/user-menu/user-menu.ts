import { Component, computed, inject, input } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';

export type UserMenuVariant = 'top' | 'sidebar';

const CHEVRON_DOWN_PATH = 'M6 9l6 6 6-6';
const CHEVRON_UP_PATH = 'm18 15-6-6-6 6';

@Component({
  selector: 'app-user-menu',
  imports: [Menu, TranslatePipe],
  templateUrl: './user-menu.html',
  host: { class: 'flex min-w-0' },
})
export class UserMenu {
  private readonly authStore = inject(AuthStore);
  private readonly translator = inject(Translator);

  readonly variant = input<UserMenuVariant>('top');
  readonly compact = input(false);

  protected readonly displayName = this.authStore.displayName;
  protected readonly chevronPath = computed(() =>
    this.variant() === 'top' ? CHEVRON_DOWN_PATH : CHEVRON_UP_PATH,
  );

  protected readonly items = computed<MenuItem[]>(() => [
    {
      label: this.translator.translate('layout.topbar.logout'),
      icon: 'pi pi-sign-out',
      command: () => void this.authStore.logout(),
    },
  ]);
}
