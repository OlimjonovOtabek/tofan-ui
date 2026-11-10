import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslationKey } from '@core/i18n/dictionary';
import { COACH_SUPPORT_URL } from '@coach/core/layout/coach-links';
import { formatCount } from '@coach/core/format/formats';
import { PushStore } from '@coach/core/push/push.store';
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
import { ProfileStore } from '../../profile.store';
import { profilePriceLabel } from '../../models/profile-price';
import { toProfileView } from '../../models/profile-view';
import { ProfilePreferencesSheets, THEME_LABELS } from './profile-preferences-sheets';

interface SettingRow {
  readonly icon: IconName;
  readonly title: TranslationKey;
  readonly subtitle: string;
  readonly run: () => void;
}

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
  providers: [ProfileStore, ProfilePreferencesSheets],
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
  private readonly push = inject(PushStore);
  private readonly preferences = inject(ProfilePreferencesSheets);

  private readonly t = (key: TranslationKey, params?: Record<string, string | number>) =>
    this.translator.translate(key, params);

  protected readonly signingOut = signal(false);
  protected readonly view = computed(() => {
    const overview = this.store.overview();
    return overview === null ? null : toProfileView(overview, this.localeStore.locale(), this.t);
  });
  protected readonly rows = computed<SettingRow[]>(() => {
    const profile = this.store.overview()?.profile;
    const locale = this.localeStore.locale();
    const price =
      profile === undefined
        ? this.t('coachApp.profile.priceUnset')
        : profilePriceLabel(profile, (value) => formatCount(value, locale), this.t);
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
        icon: 'bell',
        title: 'coachApp.posts.title',
        subtitle: this.t('coachApp.posts.subtitle'),
        run: () => this.go('posts'),
      },
      {
        icon: 'dumbbell',
        title: 'coachApp.videoCollections.title',
        subtitle: this.t('coachApp.videoCollections.subtitle'),
        run: () => this.go('video-collections'),
      },
      {
        icon: 'globe',
        title: 'coachApp.profile.language',
        subtitle: this.t(`coachApp.languages.${locale}`),
        run: () => void this.preferences.pickLanguage(),
      },
      {
        icon: 'moon',
        title: 'coachApp.profile.theme',
        subtitle: this.t(THEME_LABELS[this.theme.mode()]),
        run: () => void this.preferences.pickTheme(),
      },
      ...(this.push.supported() ? [this.pushRow()] : []),
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
      await this.push.disable().catch(keepSigningOutWhenTokenStays);
      await this.auth.logout();
      this.signingOut.set(false);
    }
  }

  private pushStatus(): TranslationKey {
    if (this.push.busy()) {
      return 'coachApp.push.working';
    }
    return this.push.enabled() ? 'coachApp.push.on' : 'coachApp.push.off';
  }

  private pushRow(): SettingRow {
    return {
      icon: 'bell',
      title: 'coachApp.push.title',
      subtitle: this.t(this.pushStatus()),
      run: () => void this.push.toggle(),
    };
  }
}

function keepSigningOutWhenTokenStays(): void {
  return;
}
