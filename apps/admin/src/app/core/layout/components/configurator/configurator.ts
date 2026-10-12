import { Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { LayoutService, MenuMode, ThemePresetName } from '@core/layout/layout.service';
import {
  NOIR_PRIMARY,
  NamedPalette,
  SURFACE_PALETTES,
  THEME_PRESET_NAMES,
  getPrimaryPalettes,
} from '@core/layout/theme/theme-palettes';

const DEFAULT_LIGHT_SURFACE = 'slate';
const DEFAULT_DARK_SURFACE = 'zinc';

@Component({
  selector: 'app-configurator',
  imports: [FormsModule, SelectButton],
  templateUrl: './configurator.html',
  host: {
    class:
      'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]',
  },
})
export class Configurator {
  private readonly layoutService = inject(LayoutService);

  readonly showMenuMode = input(true);

  protected readonly presetOptions = [...THEME_PRESET_NAMES];
  protected readonly menuModeOptions: { label: string; value: MenuMode }[] = [
    { label: 'Static', value: 'static' },
    { label: 'Overlay', value: 'overlay' },
  ];
  protected readonly surfacePalettes = SURFACE_PALETTES;

  protected readonly config = this.layoutService.layoutConfig;
  protected readonly primaryPalettes = getPrimaryPalettes();
  protected readonly selectedSurface = computed(
    () =>
      this.config().surface ??
      (this.config().darkTheme ? DEFAULT_DARK_SURFACE : DEFAULT_LIGHT_SURFACE),
  );

  protected swatchColor(palette: NamedPalette): string | undefined {
    return palette.name === NOIR_PRIMARY ? 'var(--text-color)' : palette.palette[500];
  }

  protected selectPrimary(event: Event, palette: NamedPalette): void {
    event.stopPropagation();
    this.layoutService.updateConfig({ primary: palette.name });
  }

  protected selectSurface(event: Event, palette: NamedPalette): void {
    event.stopPropagation();
    this.layoutService.updateConfig({ surface: palette.name });
  }

  protected selectPreset(preset: ThemePresetName): void {
    this.layoutService.updateConfig({ preset });
  }

  protected selectMenuMode(menuMode: MenuMode): void {
    this.layoutService.updateConfig({ menuMode });
  }
}
