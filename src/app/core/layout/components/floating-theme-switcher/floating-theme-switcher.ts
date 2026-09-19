import { Component, computed, inject } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { StyleClass } from '@openng/optimus-ui/styleclass';
import { LayoutService } from '@core/layout/layout.service';
import { Configurator } from '@core/layout/components/configurator/configurator';
import { LanguageSwitcher } from '@core/layout/components/language-switcher/language-switcher';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-floating-theme-switcher',
  imports: [Button, StyleClass, Configurator, LanguageSwitcher, TranslatePipe],
  templateUrl: './floating-theme-switcher.html',
  host: { class: 'fixed top-8 right-8 flex gap-4 z-10' },
})
export class FloatingThemeSwitcher {
  protected readonly layoutService = inject(LayoutService);

  protected readonly darkModeIcon = computed(() =>
    this.layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun',
  );
}
