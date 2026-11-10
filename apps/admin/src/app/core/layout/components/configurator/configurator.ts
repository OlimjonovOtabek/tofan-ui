import { Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LayoutService, ThemePresetName } from '@core/layout/layout.service';
import { StylePicker } from '@core/layout/components/style-picker/style-picker';
import { Swatch, SwatchPicker } from '@core/layout/components/swatch-picker/swatch-picker';
import { ThemeStyle, findActiveStyle } from '@core/layout/theme/theme-styles';
import { TINT_NAMES, cardColorFor, groundSwatchFor } from '@core/layout/theme/card-color';
import { STRONG_IDS, strongNameOf } from '@core/layout/theme/tone';
import {
  NEUTRAL_SURFACE_NAME,
  NOIR_PRIMARY,
  NamedPalette,
  SURFACE_PALETTES,
  THEME_PRESET_NAMES,
  getPrimaryPalettes,
} from '@core/layout/theme/theme-palettes';

const DEFAULT_DARK_SURFACE = 'zinc';
const NOIR_SWATCH_COLOR = 'var(--text-color)';
const SWATCH_SHADE = 500;

@Component({
  selector: 'app-configurator',
  imports: [FormsModule, SelectButton, StylePicker, SwatchPicker, TranslatePipe],
  templateUrl: './configurator.html',
  host: {
    class:
      'hidden absolute top-13 right-0 z-30 w-80 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]',
  },
})
export class Configurator {
  private readonly layoutService = inject(LayoutService);

  readonly showCardColor = input(true);

  protected readonly presetOptions = [...THEME_PRESET_NAMES];
  protected readonly config = this.layoutService.layoutConfig;

  protected readonly primarySwatches = getPrimaryPalettes().map((palette) =>
    toSwatch(palette.name, primarySwatchColor(palette)),
  );
  protected readonly surfaceSwatches = SURFACE_PALETTES.map((palette) =>
    toSwatch(palette.name, palette.palette[SWATCH_SHADE]),
  );
  protected readonly groundSwatches = computed(() =>
    toneSwatches(TINT_NAMES, (name) => this.groundColor(name)),
  );
  protected readonly strongGroundSwatches = computed(() =>
    toneSwatches(STRONG_IDS, (name) => this.groundColor(name)),
  );
  protected readonly cardSwatches = computed(() =>
    toneSwatches(TINT_NAMES, (name) => this.cardColor(name)),
  );
  protected readonly strongCardSwatches = computed(() =>
    toneSwatches(STRONG_IDS, (name) => this.cardColor(name)),
  );
  protected readonly selectedSurface = computed(
    () =>
      this.config().surface ??
      (this.config().darkTheme ? DEFAULT_DARK_SURFACE : NEUTRAL_SURFACE_NAME),
  );

  protected readonly activeStyleId = computed(() => findActiveStyle(this.config())?.id ?? null);

  protected selectStyle(style: ThemeStyle): void {
    this.layoutService.updateConfig(style.config);
  }

  protected selectPrimary(primary: string | null): void {
    if (primary !== null) {
      this.layoutService.updateConfig({ primary });
    }
  }

  protected selectSurface(surface: string | null): void {
    this.layoutService.updateConfig({ surface });
  }

  protected selectGround(ground: string | null): void {
    this.layoutService.updateConfig({ ground });
  }

  protected selectGroundMatte(groundMatte: boolean): void {
    this.layoutService.updateConfig({ groundMatte });
  }

  protected selectCardMatte(cardMatte: boolean): void {
    this.layoutService.updateConfig({ cardMatte });
  }

  private groundColor(name: string): string | null {
    const { darkTheme, groundMatte } = this.config();
    return groundSwatchFor(name, darkTheme, groundMatte);
  }

  private cardColor(name: string): string | null {
    const { darkTheme, cardMatte } = this.config();
    return cardColorFor(name, darkTheme, cardMatte);
  }

  protected selectCard(card: string | null): void {
    this.layoutService.updateConfig({ card });
  }

  protected selectPreset(preset: ThemePresetName): void {
    this.layoutService.updateConfig({ preset });
  }
}

function primarySwatchColor(palette: NamedPalette): string | undefined {
  return palette.name === NOIR_PRIMARY ? NOIR_SWATCH_COLOR : palette.palette[SWATCH_SHADE];
}

function toSwatch(name: string, color: string | null | undefined): Swatch {
  return { name, title: strongNameOf(name) ?? name, color: color ?? '' };
}

function toneSwatches(
  names: readonly string[],
  colorOf: (name: string) => string | null,
): Swatch[] {
  return names.map((name) => toSwatch(name, colorOf(name)));
}
