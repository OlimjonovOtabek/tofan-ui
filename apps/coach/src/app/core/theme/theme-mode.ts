export const THEME_MODES = ['system', 'light', 'dark'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((mode) => mode === value);
}

export function isDarkTheme(mode: ThemeMode, systemPrefersDark: boolean): boolean {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark);
}
