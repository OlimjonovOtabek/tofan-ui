import { Component, computed, inject } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Breadcrumb } from '@core/layout/components/breadcrumb/breadcrumb';
import { LanguageSwitcher } from '@core/layout/components/language-switcher/language-switcher';
import { ThemeSwitcher } from '@core/layout/components/theme-switcher/theme-switcher';
import { UserMenu } from '@core/layout/components/user-menu/user-menu';
import { LayoutService } from '@core/layout/layout.service';

@Component({
  selector: 'app-topbar',
  imports: [Breadcrumb, ThemeSwitcher, LanguageSwitcher, UserMenu, TranslatePipe],
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly layoutService = inject(LayoutService);

  protected readonly toggleLabel = computed<TranslationKey>(() =>
    this.layoutService.isRailMenu() ? 'layout.sidebar.expand' : 'layout.sidebar.collapse',
  );
  protected readonly menuExpanded = computed(() =>
    this.layoutService.isDesktop()
      ? !this.layoutService.isRailMenu()
      : this.layoutService.isSidebarActive(),
  );
}
