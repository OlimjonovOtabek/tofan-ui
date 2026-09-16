import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { updateSurfacePalette, usePreset } from '@openng/optimus-ui-themes';
import { Preset } from '@openng/optimus-ui-themes/types';
import { LayoutConfig, LayoutService } from '@core/layout/layout.service';
import {
  NOIR_PRIMARY,
  SURFACE_PALETTES,
  getPrimaryPalettes,
  loadThemePreset,
} from './theme-palettes';
import { buildPresetExtension } from './theme-preset-extension';

type ThemeSelection = Pick<LayoutConfig, 'preset' | 'primary' | 'surface'>;

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
    effect(() => {
      const selection = this.selection();
      void this.apply(selection);
    });
  }

  private async apply(selection: ThemeSelection): Promise<void> {
    const presetTokens = await loadThemePreset(selection.preset);
    if (!isSameSelection(selection, untracked(this.selection))) {
      return;
    }
    untracked(() => applyTheme(selection, presetTokens));
  }
}

function applyTheme({ preset, primary, surface }: ThemeSelection, presetTokens: Preset): void {
  const primaryPalette = getPrimaryPalettes().find((palette) => palette.name === primary) ?? {
    name: NOIR_PRIMARY,
    palette: {},
  };
  usePreset(presetTokens, buildPresetExtension(preset, primaryPalette));

  const surfacePalette = SURFACE_PALETTES.find((palette) => palette.name === surface);
  if (surfacePalette) {
    updateSurfacePalette(surfacePalette.palette);
  }
}

function isSameSelection(a: ThemeSelection, b: ThemeSelection): boolean {
  return a.preset === b.preset && a.primary === b.primary && a.surface === b.surface;
}
