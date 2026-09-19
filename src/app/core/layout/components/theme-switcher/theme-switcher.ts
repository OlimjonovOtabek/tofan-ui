import { Component, computed, inject } from '@angular/core';
import { StyleClass } from '@openng/optimus-ui/styleclass';
import { LayoutService } from '@core/layout/layout.service';
import { Configurator } from '@core/layout/components/configurator/configurator';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-theme-switcher',
  imports: [StyleClass, Configurator, TranslatePipe],
  templateUrl: './theme-switcher.html',
  host: { class: 'layout-config-menu' },
})
export class ThemeSwitcher {
  protected readonly layoutService = inject(LayoutService);

  protected readonly darkModeToggleLabel = computed<TranslationKey>(() =>
    this.layoutService.isDarkTheme() ? 'layout.topbar.lightMode' : 'layout.topbar.darkMode',
  );
}
