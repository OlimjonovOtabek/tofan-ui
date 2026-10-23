import { isDarkTheme, isThemeMode } from './theme-mode';

describe('isDarkTheme', () => {
  it('should follow the system preference when the mode is system', () => {
    expect(isDarkTheme('system', true)).toBe(true);
    expect(isDarkTheme('system', false)).toBe(false);
  });

  it('should ignore the system preference when the mode is fixed', () => {
    expect(isDarkTheme('dark', false)).toBe(true);
    expect(isDarkTheme('light', true)).toBe(false);
  });
});

describe('isThemeMode', () => {
  it('should accept only the known modes when a stored value is read', () => {
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('sepia')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});
