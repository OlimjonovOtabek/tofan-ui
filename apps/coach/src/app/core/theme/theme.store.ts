import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ThemeMode, isDarkTheme, isThemeMode } from './theme-mode';

const STORAGE_KEY = 'tofan.coach.theme';
const DARK_CLASS = 'app-dark';
const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);
  private readonly query = darkQueryOf(this.document.defaultView);
  private readonly systemDark = signal(this.query?.matches ?? false);

  readonly mode = signal<ThemeMode>(readStoredMode());
  readonly isDark = computed(() => isDarkTheme(this.mode(), this.systemDark()));

  constructor() {
    this.query?.addEventListener('change', (event) => this.systemDark.set(event.matches));
    effect(() => {
      this.document.documentElement.classList.toggle(DARK_CLASS, this.isDark());
      storeMode(this.mode());
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }
}

function darkQueryOf(view: Window | null): MediaQueryList | null {
  return typeof view?.matchMedia === 'function' ? view.matchMedia(DARK_QUERY) : null;
}

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function storeMode(mode: ThemeMode): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
    return true;
  } catch {
    return false;
  }
}
