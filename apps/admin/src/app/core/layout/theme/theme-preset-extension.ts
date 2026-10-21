import { Preset } from '@openng/optimus-ui-themes/types';
import { ThemePresetName } from '@core/layout/layout.service';
import { ColorPalette, NOIR_PRIMARY, NamedPalette } from './theme-palettes';

const NOIR_PRIMARY_SCALE = {
  50: '{surface.50}',
  100: '{surface.100}',
  200: '{surface.200}',
  300: '{surface.300}',
  400: '{surface.400}',
  500: '{surface.500}',
  600: '{surface.600}',
  700: '{surface.700}',
  800: '{surface.800}',
  900: '{surface.900}',
  950: '{surface.950}',
};

const NOIR_COLOR_SCHEME = {
  light: {
    primary: {
      color: '{primary.950}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.800}',
      activeColor: '{primary.700}',
    },
    highlight: {
      background: '{primary.950}',
      focusBackground: '{primary.700}',
      color: '#ffffff',
      focusColor: '#ffffff',
    },
  },
  dark: {
    primary: {
      color: '{primary.50}',
      contrastColor: '{primary.950}',
      hoverColor: '{primary.200}',
      activeColor: '{primary.300}',
    },
    highlight: {
      background: '{primary.50}',
      focusBackground: '{primary.300}',
      color: '{primary.950}',
      focusColor: '{primary.950}',
    },
  },
};

const NORA_COLOR_SCHEME = {
  light: {
    primary: {
      color: '{primary.600}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.700}',
      activeColor: '{primary.800}',
    },
    highlight: {
      background: '{primary.600}',
      focusBackground: '{primary.700}',
      color: '#ffffff',
      focusColor: '#ffffff',
    },
  },
  dark: {
    primary: {
      color: '{primary.500}',
      contrastColor: '{surface.900}',
      hoverColor: '{primary.400}',
      activeColor: '{primary.300}',
    },
    highlight: {
      background: '{primary.500}',
      focusBackground: '{primary.400}',
      color: '{surface.900}',
      focusColor: '{surface.900}',
    },
  },
};

const DEFAULT_COLOR_SCHEME = {
  light: {
    primary: {
      color: '{primary.500}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.600}',
      activeColor: '{primary.700}',
    },
    highlight: {
      background: '{primary.50}',
      focusBackground: '{primary.100}',
      color: '{primary.700}',
      focusColor: '{primary.800}',
    },
  },
  dark: {
    primary: {
      color: '{primary.400}',
      contrastColor: '{surface.900}',
      hoverColor: '{primary.300}',
      activeColor: '{primary.200}',
    },
    highlight: {
      background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
      focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
      color: 'rgba(255,255,255,.87)',
      focusColor: 'rgba(255,255,255,.87)',
    },
  },
};

const SURFACE_SHADES = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LIGHT_SURFACE_WHITE_PERCENT = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
const DARK_SURFACE_WHITE_PERCENT = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

function tintedSurface(base: string, whitePercent: readonly number[]): Record<number, string> {
  return Object.fromEntries(
    SURFACE_SHADES.map((shade, index) => [
      shade,
      `color-mix(in srgb, ${base}, white ${whitePercent[index]}%)`,
    ]),
  );
}

const TINTED_SURFACES = {
  light: { surface: tintedSurface('{primary.900}', LIGHT_SURFACE_WHITE_PERCENT) },
  dark: { surface: tintedSurface('var(--surface-ground)', DARK_SURFACE_WHITE_PERCENT) },
};

const OVERLAY_RADIUS = {
  modal: { borderRadius: '1.5rem' },
  popover: { borderRadius: '10px' },
};

export function buildPresetExtension(preset: ThemePresetName, primary: NamedPalette): Preset {
  if (primary.name === NOIR_PRIMARY) {
    return { semantic: { primary: NOIR_PRIMARY_SCALE, colorScheme: NOIR_COLOR_SCHEME } };
  }
  const colorScheme = preset === 'Nora' ? NORA_COLOR_SCHEME : DEFAULT_COLOR_SCHEME;
  return withPalette(primary.palette, colorScheme);
}

function withPalette(palette: ColorPalette, colorScheme: typeof DEFAULT_COLOR_SCHEME): Preset {
  return {
    semantic: {
      primary: palette,
      overlay: OVERLAY_RADIUS,
      colorScheme: {
        light: { ...colorScheme.light, ...TINTED_SURFACES.light },
        dark: { ...colorScheme.dark, ...TINTED_SURFACES.dark },
      },
    },
  };
}
