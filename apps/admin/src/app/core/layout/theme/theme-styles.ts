import type { TranslationKey } from '@core/i18n/dictionary';
import type { LayoutConfig } from '@core/layout/layout.service';
import { cardColorFor } from './card-color';
import { shellGroundFor } from './surface-ground';
import { NOIR_PRIMARY, SURFACE_PALETTES, getPrimaryPalettes } from './theme-palettes';

export type ThemeStyleConfig = Pick<
  LayoutConfig,
  'preset' | 'primary' | 'surface' | 'ground' | 'groundMatte' | 'card' | 'cardMatte' | 'darkTheme'
>;

export interface ThemeStyle {
  readonly id: string;
  readonly label: TranslationKey;
  readonly config: ThemeStyleConfig;
}

export interface ThemeStylePreview {
  readonly ground: string;
  readonly sheet: string;
  readonly accent: string;
}

const LIGHT_SHEET = '#ffffff';
const DARK_SHEET_WHITE_PERCENT = 10;
const LIGHT_ACCENT_SHADE = 500;
const DARK_ACCENT_SHADE = 400;
const DARK_SURFACE_SHADE = 900;
const NOIR_ACCENT = { light: '#18181b', dark: '#fafafa' };

export const THEME_STYLES: readonly ThemeStyle[] = [
  {
    id: 'classic',
    label: 'layout.configurator.styles.classic',
    config: {
      preset: 'Aura',
      primary: 'blue',
      surface: null,
      ground: null,
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'ocean',
    label: 'layout.configurator.styles.ocean',
    config: {
      preset: 'Aura',
      primary: 'sky',
      surface: 'slate',
      ground: 'cyan',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'forest',
    label: 'layout.configurator.styles.forest',
    config: {
      preset: 'Nora',
      primary: 'emerald',
      surface: 'stone',
      ground: 'green',
      groundMatte: false,
      card: 'emerald',
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'sunset',
    label: 'layout.configurator.styles.sunset',
    config: {
      preset: 'Lara',
      primary: 'orange',
      surface: 'stone',
      ground: 'amber',
      groundMatte: false,
      card: 'orange',
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'lavender',
    label: 'layout.configurator.styles.lavender',
    config: {
      preset: 'Aura',
      primary: 'violet',
      surface: 'zinc',
      ground: 'violet',
      groundMatte: false,
      card: 'purple',
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'blossom',
    label: 'layout.configurator.styles.blossom',
    config: {
      preset: 'Aura',
      primary: 'pink',
      surface: 'neutral',
      ground: 'rose',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'graphite',
    label: 'layout.configurator.styles.graphite',
    config: {
      preset: 'Aura',
      primary: 'noir',
      surface: 'zinc',
      ground: 'noir',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: false,
    },
  },
  {
    id: 'midnight',
    label: 'layout.configurator.styles.midnight',
    config: {
      preset: 'Aura',
      primary: 'indigo',
      surface: 'slate',
      ground: 'indigo',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: true,
    },
  },
  {
    id: 'aurora',
    label: 'layout.configurator.styles.aurora',
    config: {
      preset: 'Nora',
      primary: 'teal',
      surface: 'ocean',
      ground: 'teal',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: true,
    },
  },
  {
    id: 'carbon',
    label: 'layout.configurator.styles.carbon',
    config: {
      preset: 'Aura',
      primary: 'noir',
      surface: 'zinc',
      ground: 'noir',
      groundMatte: false,
      card: null,
      cardMatte: false,
      darkTheme: true,
    },
  },
];

export function findActiveStyle(config: ThemeStyleConfig): ThemeStyle | undefined {
  return THEME_STYLES.find((style) => isSameStyle(style.config, config));
}

export function stylePreview({ config }: ThemeStyle): ThemeStylePreview {
  const ground = shellGroundFor(
    config.ground,
    config.primary,
    config.darkTheme,
    config.groundMatte,
  );
  return {
    ground: ground.background,
    sheet:
      cardColorFor(config.card, config.darkTheme, config.cardMatte) ??
      defaultSheet(config, ground.top),
    accent: accentFor(config.primary, config.darkTheme),
  };
}

function isSameStyle(a: ThemeStyleConfig, b: ThemeStyleConfig): boolean {
  return (
    a.preset === b.preset &&
    a.primary === b.primary &&
    a.surface === b.surface &&
    a.ground === b.ground &&
    a.groundMatte === b.groundMatte &&
    a.card === b.card &&
    a.cardMatte === b.cardMatte &&
    a.darkTheme === b.darkTheme
  );
}

function defaultSheet(config: ThemeStyleConfig, groundTop: string): string {
  if (!config.darkTheme) {
    return LIGHT_SHEET;
  }
  const surface = SURFACE_PALETTES.find((palette) => palette.name === config.surface);
  return (
    surface?.palette[DARK_SURFACE_SHADE] ??
    `color-mix(in srgb, ${groundTop}, #ffffff ${DARK_SHEET_WHITE_PERCENT}%)`
  );
}

function accentFor(primary: string, darkTheme: boolean): string {
  if (primary === NOIR_PRIMARY) {
    return darkTheme ? NOIR_ACCENT.dark : NOIR_ACCENT.light;
  }
  const palette = getPrimaryPalettes().find((candidate) => candidate.name === primary)?.palette;
  return palette?.[darkTheme ? DARK_ACCENT_SHADE : LIGHT_ACCENT_SHADE] ?? NOIR_ACCENT.light;
}
