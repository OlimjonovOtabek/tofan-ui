import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { readStoredLayoutConfig, storeLayoutConfig } from './layout-config.storage';
import { cardColorFor } from './theme/card-color';
import { shellGroundFor } from './theme/surface-ground';
import { strongNameOf } from './theme/tone';

export type ThemePresetName = 'Aura' | 'Lara' | 'Nora';

export interface LayoutConfig {
  preset: ThemePresetName;
  primary: string;
  surface: string | null;
  ground: string | null;
  groundMatte: boolean;
  card: string | null;
  cardMatte: boolean;
  darkTheme: boolean;
  menuCollapsed: boolean;
}

interface LayoutState {
  mobileMenuActive: boolean;
  activeMenuPath: string | null;
}

const DARK_THEME_CLASS = 'app-dark';
const BLOCKED_SCROLL_CLASS = 'blocked-scroll';
const DESKTOP_MEDIA_QUERY = '(min-width: 960px)';
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  preset: 'Aura',
  primary: 'blue',
  surface: null,
  ground: null,
  groundMatte: false,
  card: null,
  cardMatte: false,
  darkTheme: false,
  menuCollapsed: false,
};

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly document = inject(DOCUMENT);

  private readonly config = signal<LayoutConfig>(readStoredLayoutConfig(DEFAULT_LAYOUT_CONFIG));

  private readonly state = signal<LayoutState>({
    mobileMenuActive: false,
    activeMenuPath: null,
  });

  private readonly desktop = signal(this.watchDesktop());

  readonly layoutConfig = this.config.asReadonly();
  readonly layoutState = this.state.asReadonly();
  readonly isDesktop = this.desktop.asReadonly();

  readonly isDarkTheme = computed(() => this.config().darkTheme);
  readonly isSidebarActive = computed(() => this.state().mobileMenuActive);
  readonly isRailMenu = computed(() => this.config().menuCollapsed && this.desktop());
  readonly cardBackground = computed(() => {
    const { card, darkTheme, cardMatte } = this.config();
    return cardColorFor(card, darkTheme, cardMatte);
  });
  readonly isStrongGround = computed(
    () => !this.config().darkTheme && strongNameOf(this.config().ground) !== null,
  );

  constructor() {
    effect(() => this.applyDarkTheme(this.config().darkTheme));
    effect(() => this.applySurfaceGround(this.config()));
    effect(() => storeLayoutConfig(this.config()));
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
    if (this.desktop()) {
      this.updateConfig({ menuCollapsed: !this.config().menuCollapsed });
      return;
    }
    this.state.update((state) => ({ ...state, mobileMenuActive: !state.mobileMenuActive }));
  }

  hideMenu(): void {
    this.state.update((state) => ({ ...state, mobileMenuActive: false }));
  }

  setActiveMenuPath(path: string | null): void {
    this.state.update((state) => ({ ...state, activeMenuPath: path }));
  }

  private watchDesktop(): boolean {
    const query = this.document.defaultView?.matchMedia?.(DESKTOP_MEDIA_QUERY);
    if (!query) {
      return true;
    }
    query.addEventListener('change', (event) => this.onViewportChange(event.matches));
    return query.matches;
  }

  private onViewportChange(desktop: boolean): void {
    this.desktop.set(desktop);
    if (desktop) {
      this.hideMenu();
    }
  }

  private applySurfaceGround({ primary, ground, groundMatte, darkTheme }: LayoutConfig): void {
    const { background, top } = shellGroundFor(ground, primary, darkTheme, groundMatte);
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
