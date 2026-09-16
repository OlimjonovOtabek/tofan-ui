import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { updateSurfacePalette, usePreset } from '@openng/optimus-ui-themes';
import { Preset } from '@openng/optimus-ui-themes/types';
import { LayoutConfig, LayoutService } from '../layout.service';
import {
  NOIR_PRIMARY,
  SURFACE_PALETTES,
  getPrimaryPalettes,
  loadThemePreset,
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
    effect(() => {
      const selection = this.selection();
      void this.apply(selection);
    });
  }

  private async apply(selection: ThemeSelection): Promise<void> {
    const presetTokens = await loadThemePreset(selection.preset);
    // A later pick may have finished loading first; only the current one may paint.
    if (!isSameSelection(selection, untracked(this.selection))) {
      return;
    }
    // Applying a theme synchronously notifies UI components, which read their own config
    // signals. Untracked, so those reads don't become dependencies that re-trigger the effect.
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
