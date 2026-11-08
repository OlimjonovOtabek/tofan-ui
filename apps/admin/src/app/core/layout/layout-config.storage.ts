import type { LayoutConfig, MenuMode } from './layout.service';
import {
  NOIR_PRIMARY,
  PRIMARY_COLOR_NAMES,
  SURFACE_PALETTES,
  THEME_PRESET_NAMES,
} from './theme/theme-palettes';

const LAYOUT_CONFIG_STORAGE_KEY = 'tofan.admin.layout';
const MENU_MODES: readonly MenuMode[] = ['static', 'overlay'];
const PRIMARY_NAMES: readonly string[] = [NOIR_PRIMARY, ...PRIMARY_COLOR_NAMES];
const SURFACE_NAMES: readonly string[] = SURFACE_PALETTES.map((palette) => palette.name);

export function readStoredLayoutConfig(defaults: LayoutConfig): LayoutConfig {
  try {
    const stored = localStorage.getItem(LAYOUT_CONFIG_STORAGE_KEY);
    return stored === null ? defaults : toLayoutConfig(parseJson(stored), defaults);
  } catch {
    return defaults;
  }
}

export function storeLayoutConfig(config: LayoutConfig): boolean {
  try {
    localStorage.setItem(LAYOUT_CONFIG_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function toLayoutConfig(stored: unknown, defaults: LayoutConfig): LayoutConfig {
  if (!isRecord(stored)) {
    return defaults;
  }
  return {
    preset: pick(stored['preset'], THEME_PRESET_NAMES, defaults.preset),
    primary: pick(stored['primary'], PRIMARY_NAMES, defaults.primary),
    surface:
      stored['surface'] === null ? null : pick(stored['surface'], SURFACE_NAMES, defaults.surface),
    darkTheme: typeof stored['darkTheme'] === 'boolean' ? stored['darkTheme'] : defaults.darkTheme,
    menuMode: pick(stored['menuMode'], MENU_MODES, defaults.menuMode),
  };
}

function parseJson(text: string): unknown {
  const parsed: unknown = JSON.parse(text);
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick<T extends string | null>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback;
}
