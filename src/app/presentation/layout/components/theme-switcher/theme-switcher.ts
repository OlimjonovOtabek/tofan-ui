import { Component, computed, inject } from '@angular/core';
import { StyleClass } from '@openng/optimus-ui/styleclass';
import { LayoutService } from '../../layout.service';
import { Configurator } from '../configurator/configurator';

/** Dark mode toggle plus the palette popover, rendered inside the topbar. */
@Component({
  selector: 'app-theme-switcher',
  imports: [StyleClass, Configurator],
  templateUrl: './theme-switcher.html',
  host: { class: 'layout-config-menu' },
})
export class ThemeSwitcher {
  protected readonly layoutService = inject(LayoutService);

  protected readonly darkModeToggleLabel = computed(() =>
    this.layoutService.isDarkTheme() ? "Yorug' rejim" : "Qorong'u rejim",
  );
}
