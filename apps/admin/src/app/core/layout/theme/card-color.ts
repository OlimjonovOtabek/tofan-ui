import { DARK_GROUNDS, LIGHT_GROUNDS } from './surface-ground';
import { STRONG_IDS, strongColorFor, withMatte } from './tone';

const LIGHT_CARD_WHITE_PERCENT = 55;
const DARK_CARD_WHITE_PERCENT = 7;

export const TINT_NAMES: readonly string[] = Object.keys(LIGHT_GROUNDS);
export const TONE_IDS: readonly string[] = [...TINT_NAMES, ...STRONG_IDS];

export function cardColorFor(
  name: string | null,
  darkTheme: boolean,
  matte = false,
): string | null {
  if (name === null) {
    return null;
  }
  const color = strongColorFor(name, 'card', darkTheme) ?? tintCardColor(name, darkTheme);
  return color === null ? null : withMatte(color, matte);
}

export function groundSwatchFor(name: string, darkTheme: boolean, matte = false): string | null {
  const color = strongColorFor(name, 'ground', darkTheme) ?? tintGroundColor(name, darkTheme);
  return color === null ? null : withMatte(color, matte);
}

function tintCardColor(name: string, darkTheme: boolean): string | null {
  const light = LIGHT_GROUNDS[name];
  const dark = DARK_GROUNDS[name];
  if (!light || !dark) {
    return null;
  }
  return darkTheme
    ? `color-mix(in srgb, ${dark}, #ffffff ${DARK_CARD_WHITE_PERCENT}%)`
    : `color-mix(in srgb, ${light.top}, #ffffff ${LIGHT_CARD_WHITE_PERCENT}%)`;
}

function tintGroundColor(name: string, darkTheme: boolean): string | null {
  const light = LIGHT_GROUNDS[name];
  const dark = DARK_GROUNDS[name];
  if (!light || !dark) {
    return null;
  }
  return darkTheme ? dark : light.top;
}
