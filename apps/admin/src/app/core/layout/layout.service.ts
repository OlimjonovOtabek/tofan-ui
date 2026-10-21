import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { surfaceGroundFor } from './theme/surface-ground';

export type MenuMode = 'static' | 'overlay';
export type ThemePresetName = 'Aura' | 'Lara' | 'Nora';

export interface LayoutConfig {
  preset: ThemePresetName;
  primary: string;
  surface: string | null;
  darkTheme: boolean;
  menuMode: MenuMode;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  mobileMenuActive: boolean;
  activeMenuPath: string | null;
}

const DARK_THEME_CLASS = 'app-dark';
const BLOCKED_SCROLL_CLASS = 'blocked-scroll';
const DESKTOP_MIN_WIDTH = 992;

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly document = inject(DOCUMENT);

  private readonly config = signal<LayoutConfig>({
    preset: 'Aura',
    primary: 'blue',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
  });

  private readonly state = signal<LayoutState>({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    mobileMenuActive: false,
    activeMenuPath: null,
  });

  readonly layoutConfig = this.config.asReadonly();
  readonly layoutState = this.state.asReadonly();

  readonly isDarkTheme = computed(() => this.config().darkTheme);
  readonly isSidebarActive = computed(
    () => this.state().overlayMenuActive || this.state().mobileMenuActive,
  );

  constructor() {
    effect(() => this.applyDarkTheme(this.config().darkTheme));
    effect(() => this.applySurfaceGround(this.config()));
    effect(() =>
      this.document.body.classList.toggle(BLOCKED_SCROLL_CLASS, this.state().mobileMenuActive),
    );
  }

  updateConfig(changes: Partial<LayoutConfig>): void {
    this.config.update((config) => ({ ...config, ...changes }));
  }

  toggleDarkTheme(): void {
    this.updateConfig({ darkTheme: !this.config().darkTheme });
  }

  toggleMenu(): void {
    if (!this.isDesktop()) {
      this.state.update((state) => ({ ...state, mobileMenuActive: !state.mobileMenuActive }));
    } else if (this.config().menuMode === 'overlay') {
      this.state.update((state) => ({ ...state, overlayMenuActive: !state.overlayMenuActive }));
    } else {
      this.state.update((state) => ({
        ...state,
        staticMenuDesktopInactive: !state.staticMenuDesktopInactive,
      }));
    }
  }

  hideMenu(): void {
    this.state.update((state) => ({ ...state, overlayMenuActive: false, mobileMenuActive: false }));
  }

  setActiveMenuPath(path: string | null): void {
    this.state.update((state) => ({ ...state, activeMenuPath: path }));
  }

  private isDesktop(): boolean {
    return (this.document.defaultView?.innerWidth ?? DESKTOP_MIN_WIDTH) >= DESKTOP_MIN_WIDTH;
  }

  private applySurfaceGround({ primary, darkTheme }: LayoutConfig): void {
    const { background, top } = surfaceGroundFor(primary, darkTheme);
    const rootStyle = this.document.documentElement.style;
    rootStyle.setProperty('--surface-ground', background);
    rootStyle.setProperty('--surface-ground-top', top);
  }

  private applyDarkTheme(enabled: boolean): void {
    const rootClasses = this.document.documentElement.classList;
    if (rootClasses.contains(DARK_THEME_CLASS) === enabled) {
      return;
    }

    const toggle = () => rootClasses.toggle(DARK_THEME_CLASS, enabled);

    if (typeof this.document.startViewTransition === 'function') {
      this.document.startViewTransition(toggle);
    } else {
      toggle();
    }
  }
}
