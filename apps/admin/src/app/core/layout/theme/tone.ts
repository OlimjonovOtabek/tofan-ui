import {
  ColorShade,
  NOIR_PRIMARY,
  PRIMARY_COLOR_NAMES,
  SURFACE_PALETTES,
  getPrimaryPalettes,
} from './theme-palettes';

export type ToneTarget = 'ground' | 'card';

const STRONG_PREFIX = 'strong-';
const NOIR_SURFACE_NAME = 'zinc';
const MATTE_CHROMA_SCALE = 0.4;

const STRONG_SHADES: Readonly<Record<ToneTarget, { light: ColorShade; dark: ColorShade }>> = {
  ground: { light: 600, dark: 900 },
  card: { light: 100, dark: 900 },
};

export const STRONG_NAMES: readonly string[] = [NOIR_PRIMARY, ...PRIMARY_COLOR_NAMES];
export const STRONG_IDS: readonly string[] = STRONG_NAMES.map((name) => STRONG_PREFIX + name);

export function strongNameOf(id: string | null): string | null {
  if (id === null || !id.startsWith(STRONG_PREFIX)) {
    return null;
  }
  const name = id.slice(STRONG_PREFIX.length);
  return STRONG_NAMES.includes(name) ? name : null;
}

export function strongColorFor(id: string, target: ToneTarget, darkTheme: boolean): string | null {
  const name = strongNameOf(id);
  if (name === null) {
    return null;
  }
  const shades = STRONG_SHADES[target];
  return paletteOf(name)?.[darkTheme ? shades.dark : shades.light] ?? null;
}

export function matteColor(color: string): string {
  return `oklch(from ${color} l calc(c * ${MATTE_CHROMA_SCALE}) h)`;
}

export function withMatte(color: string, matte: boolean): string {
  return matte ? matteColor(color) : color;
}

function paletteOf(name: string): Partial<Record<ColorShade, string>> | undefined {
  if (name === NOIR_PRIMARY) {
    return SURFACE_PALETTES.find((palette) => palette.name === NOIR_SURFACE_NAME)?.palette;
  }
  return getPrimaryPalettes().find((palette) => palette.name === name)?.palette;
}
