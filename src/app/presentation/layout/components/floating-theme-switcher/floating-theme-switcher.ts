import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { StyleClass } from 'primeng/styleclass';
import { LayoutService } from '../../layout.service';
import { Configurator } from '../configurator/configurator';

/** Theme controls pinned to the corner of pages rendered without the app layout. */
@Component({
  selector: 'app-floating-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, StyleClass, Configurator],
  templateUrl: './floating-theme-switcher.html',
  host: { class: 'fixed top-8 right-8 flex gap-4 z-10' },
})
export class FloatingThemeSwitcher {
  protected readonly layoutService = inject(LayoutService);

  protected readonly darkModeIcon = computed(() =>
    this.layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun',
  );
}
