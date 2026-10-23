import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { APP_LOCALES, AppLocale } from '@core/i18n/locale';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslationKey } from '@core/i18n/dictionary';
import { COACH_SUPPORT_URL, TRAINER_PAGE_URL } from '@coach/core/layout/coach-links';
import { formatCount, formatMoneyShort } from '@coach/core/format/formats';
import { THEME_MODES, ThemeMode } from '@coach/core/theme/theme-mode';
import { ThemeStore } from '@coach/core/theme/theme.store';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { IconName } from '@coach/core/ui/icon/icon-name';
import { MetricTile } from '@coach/core/ui/metric-tile/metric-tile';
import { Note } from '@coach/core/ui/note/note';
import { PillButton } from '@coach/core/ui/pill-button/pill-button';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { initialsOf } from '@coach/core/clients/client-activity';
import { ProfileStore } from '../../profile.store';
import { isGeneratedSlug, monthlyRevenue, publishedPrograms } from '../../models/profile-overview';

interface SettingRow {
  readonly icon: IconName;
  readonly title: TranslationKey;
  readonly subtitle: string;
  readonly run: () => void;
}

const THEME_LABELS: Readonly<Record<ThemeMode, TranslationKey>> = {
  system: 'coachApp.theme.system',
  light: 'coachApp.theme.light',
  dark: 'coachApp.theme.dark',
};

@Component({
  selector: 'coach-profile-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    Avatar,
    Button,
    EmptyState,
    Icon,
    MetricTile,
    Note,
    PillButton,
    Shimmer,
  ],
  providers: [ProfileStore],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  protected readonly store = inject(ProfileStore);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly auth = inject(AuthStore);
  private readonly theme = inject(ThemeStore);
  private readonly localeStore = inject(LocaleStore);
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);

  private readonly t = (key: TranslationKey, params?: Record<string, string | number>) =>
    this.translator.translate(key, params);

  protected readonly signingOut = signal(false);
  protected readonly view = computed(() => {
    const overview = this.store.overview();
    if (overview === null) {
      return null;
    }
    const locale = this.localeStore.locale();
    const unknown = this.t('coachApp.common.unknown');
    const { profile } = overview;
    const revenue = monthlyRevenue(overview);
    const programs = publishedPrograms(overview);
    const words = profile.displayName.trim().split(/\s+/);
    return {
      profile,
      initials: initialsOf(words[0], words.length > 1 ? words[words.length - 1] : null),
      link: profile.slug ? `${TRAINER_PAGE_URL}${profile.slug}` : null,
      generated: profile.slug !== null && isGeneratedSlug(profile.slug),
      clients: overview.clientCount === null ? unknown : String(overview.clientCount),
      revenue: revenue === null ? unknown : formatMoneyShort(revenue, locale),
      adherence: overview.averageAdherence === null ? unknown : String(overview.averageAdherence),
      programs: programs === null ? unknown : String(programs),
      split:
        programs === null
          ? null
          : this.t('coachApp.profile.programsSplit', {
              workout: overview.publishedWorkoutPrograms ?? 0,
              meal: overview.publishedMealPrograms ?? 0,
            }),
    };
  });
  protected readonly rows = computed<SettingRow[]>(() => {
    const profile = this.store.overview()?.profile;
    const locale = this.localeStore.locale();
    const price =
      profile?.monthlyPrice == null
        ? this.t('coachApp.profile.priceUnset')
        : `${formatCount(profile.monthlyPrice, locale)} ${this.t('coachApp.profile.priceUnit')}`;
    return [
      {
        icon: 'credit-card',
        title: 'coachApp.profile.priceLabel',
        subtitle: price,
        run: () => this.go('pricing'),
      },
      {
        icon: 'wallet',
        title: 'coachApp.earnings.title',
        subtitle: this.t('coachApp.earnings.entrySubtitle'),
        run: () => this.go('earnings'),
      },
      {
        icon: 'play',
        title: 'coachApp.previewVideos.title',
        subtitle: this.t('coachApp.previewVideos.subtitle'),
        run: () => this.go('preview-videos'),
      },
      {
        icon: 'globe',
        title: 'coachApp.profile.language',
        subtitle: this.t(`coachApp.languages.${locale}`),
        run: () => void this.pickLanguage(),
      },
      {
        icon: 'moon',
        title: 'coachApp.profile.theme',
        subtitle: this.t(THEME_LABELS[this.theme.mode()]),
        run: () => void this.pickTheme(),
      },
      {
        icon: 'message-circle',
        title: 'coachApp.profile.supportTitle',
        subtitle: this.t('coachApp.profile.supportSubtitle'),
        run: () => window.open(COACH_SUPPORT_URL, '_blank', 'noopener'),
      },
    ];
  });

  constructor() {
    void this.store.load();
  }

  protected go(path: string): void {
    void this.router.navigate(['/profile', path]);
  }

  protected chosen(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.files?.[0]) {
      void this.store.changePhoto(input.files[0]);
      input.value = '';
    }
  }

  protected copy(link: string): void {
    void this.clipboard.copy(link, 'coachApp.profile.linkCopiedWhat');
  }

  protected async share(link: string): Promise<void> {
    if (typeof navigator.share === 'function') {
      await navigator.share({ url: link }).catch(() => undefined);
    } else {
      this.copy(link);
    }
  }

  protected async signOut(): Promise<void> {
    const confirmed = await this.sheets.confirm({
      title: this.t('coachApp.logout.confirmTitle'),
      message: this.t('coachApp.logout.confirmMessage'),
      confirmLabel: this.t('coachApp.logout.logout'),
      cancelLabel: this.t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      this.signingOut.set(true);
      await this.auth.logout();
      this.signingOut.set(false);
    }
  }

  private async pickLanguage(): Promise<void> {
    const locale = await this.sheets.choose<AppLocale>(
      this.t('coachApp.profile.languageSheetTitle'),
      APP_LOCALES.map((value) => ({
        value,
        title: this.t(`coachApp.languages.${value}`),
        selected: value === this.localeStore.locale(),
      })),
    );
    if (locale !== null) {
      this.localeStore.setLocale(locale);
    }
  }

  private async pickTheme(): Promise<void> {
    const mode = await this.sheets.choose<ThemeMode>(
      this.t('coachApp.profile.themeSheetTitle'),
      THEME_MODES.map((value) => ({
        value,
        title: this.t(THEME_LABELS[value]),
        subtitle: value === 'system' ? this.t('coachApp.theme.systemHint') : undefined,
        selected: value === this.theme.mode(),
      })),
    );
    if (mode !== null) {
      this.theme.setMode(mode);
    }
  }
}
