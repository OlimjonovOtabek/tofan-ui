import { Injectable, computed, effect, inject } from '@angular/core';
import { updateSurfacePalette, usePreset } from '@openng/optimus-ui-themes';
import { LayoutConfig, LayoutService } from '../layout.service';
import {
  NOIR_PRIMARY,
  SURFACE_PALETTES,
  THEME_PRESETS,
  getPrimaryPalettes,
} from './theme-palettes';
import { buildPresetExtension } from './theme-preset-extension';

type ThemeSelection = Pick<LayoutConfig, 'preset' | 'primary' | 'surface'>;

/** Applies the preset, primary and surface colors chosen in the layout config to Optimus UI. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly layoutService = inject(LayoutService);

  private readonly selection = computed<ThemeSelection>(
    () => {
      const { preset, primary, surface } = this.layoutService.layoutConfig();
      return { preset, primary, surface };
    },
    { equal: isSameSelection },
  );

  constructor() {
    effect(() => applyTheme(this.selection()));
  }
}

function applyTheme({ preset, primary, surface }: ThemeSelection): void {
  const primaryPalette = getPrimaryPalettes(preset).find((palette) => palette.name === primary) ?? {
    name: NOIR_PRIMARY,
    palette: {},
  };
  usePreset(THEME_PRESETS[preset], buildPresetExtension(preset, primaryPalette));

  const surfacePalette = SURFACE_PALETTES.find((palette) => palette.name === surface);
  if (surfacePalette) {
    updateSurfacePalette(surfacePalette.palette);
  }
}

function isSameSelection(a: ThemeSelection, b: ThemeSelection): boolean {
  return a.preset === b.preset && a.primary === b.primary && a.surface === b.surface;
}
