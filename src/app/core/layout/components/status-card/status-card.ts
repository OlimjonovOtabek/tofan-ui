import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FloatingThemeSwitcher } from '@core/layout/components/floating-theme-switcher/floating-theme-switcher';
import { AppPaths } from '@core/config/app-paths';
import { Button } from '@openng/optimus-ui/button';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export type StatusCardAccent = 'primary' | 'warn' | 'danger';

interface AccentStyle {
  gradientColor: string;
  iconClass: string;
  buttonSeverity: 'primary' | 'warn' | 'danger';
}

const ACCENT_STYLES: Record<StatusCardAccent, AccentStyle> = {
  primary: {
    gradientColor: 'color-mix(in srgb, var(--primary-color), transparent 60%)',
    iconClass: 'border-primary text-primary',
    buttonSeverity: 'primary',
  },
  warn: {
    gradientColor: 'rgba(247, 149, 48, 0.4)',
    iconClass: 'border-orange-500 text-orange-500',
    buttonSeverity: 'warn',
  },
  danger: {
    gradientColor: 'rgba(233, 30, 99, 0.4)',
    iconClass: 'border-pink-500 text-pink-500',
    buttonSeverity: 'danger',
  },
};

@Component({
  selector: 'app-status-card',
  imports: [RouterLink, Button, FloatingThemeSwitcher, TranslatePipe],
  templateUrl: './status-card.html',
})
export class StatusCard {
  readonly icon = input.required<string>();
  readonly title = input.required<TranslationKey>();
  readonly message = input.required<TranslationKey>();
  readonly accent = input<StatusCardAccent>('primary');

  protected readonly dashboardPath = AppPaths.dashboard;
  protected readonly style = computed(() => ACCENT_STYLES[this.accent()]);
}
