import { Injectable, inject } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { APP_LOCALES, AppLocale } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { Translator } from '@core/i18n/translator';
import { THEME_MODES, ThemeMode } from '@coach/core/theme/theme-mode';
import { ThemeStore } from '@coach/core/theme/theme.store';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';

export const THEME_LABELS: Readonly<Record<ThemeMode, TranslationKey>> = {
  system: 'coachApp.theme.system',
  light: 'coachApp.theme.light',
  dark: 'coachApp.theme.dark',
};

@Injectable()
export class ProfilePreferencesSheets {
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);
  private readonly theme = inject(ThemeStore);

  async pickLanguage(): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const locale = await this.sheets.choose<AppLocale>(
      t('coachApp.profile.languageSheetTitle'),
      APP_LOCALES.map((value) => ({
        value,
        title: t(`coachApp.languages.${value}`),
        selected: value === this.localeStore.locale(),
      })),
    );
    if (locale !== null) {
      this.localeStore.setLocale(locale);
    }
  }

  async pickTheme(): Promise<void> {
    const t = this.translator.translate.bind(this.translator);
    const mode = await this.sheets.choose<ThemeMode>(
      t('coachApp.profile.themeSheetTitle'),
      THEME_MODES.map((value) => ({
        value,
        title: t(THEME_LABELS[value]),
        subtitle: value === 'system' ? t('coachApp.theme.systemHint') : undefined,
        selected: value === this.theme.mode(),
      })),
    );
    if (mode !== null) {
      this.theme.setMode(mode);
    }
  }
}
