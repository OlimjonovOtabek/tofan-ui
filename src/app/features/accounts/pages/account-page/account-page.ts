import { Component, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { formatDateTime } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { Tag } from '@openng/optimus-ui/tag';
import { AccountStore } from '../../account.store';
import { Account } from '../../models/account';

@Component({
  selector: 'app-account-page',
  imports: [
    RouterLink,
    Button,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Tag,
    TranslatePipe,
    MessagePipe,
  ],
  providers: [AccountStore],
  templateUrl: './account-page.html',
})
export class AccountPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(AccountStore);

  protected readonly accountsPath = AppPaths.accounts;
  protected readonly soldiersPath = AppPaths.soldiers;
  protected readonly userSessionsPath = AppPaths.userSessions;
  protected readonly sendNotificationPath = AppPaths.sendNotification;

  readonly userId = input.required<string>();

  constructor() {
    effect(() => {
      const userId = this.userId();
      untracked(() => void this.store.load(userId));
    });
  }

  protected registeredLabel(account: Account): string {
    return formatDateTime(account.registeredAt, this.localeStore.locale());
  }

  protected copyId(account: Account): Promise<void> {
    return this.clipboard.copy(account.id, 'accounts.card.userId');
  }

  protected async block(account: Account): Promise<void> {
    const warning = this.store.isAdmin()
      ? this.translator.translate('accounts.confirm.adminWarning')
      : '';
    const confirmed = await this.confirmations.confirm(
      {
        key: 'accounts.confirm.block',
        params: { warning, name: account.userName },
      },
      'accounts.confirm.blockHeader',
    );
    if (confirmed) {
      await this.store.run('block');
    }
  }

  protected async unblock(account: Account): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      { key: 'accounts.confirm.unblock', params: { name: account.userName } },
      'accounts.confirm.unblockHeader',
    );
    if (confirmed) {
      await this.store.run('unblock');
    }
  }

  protected async logoutEverywhere(account: Account): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      { key: 'accounts.confirm.logout', params: { name: account.userName } },
      'accounts.confirm.logoutHeader',
    );
    if (confirmed) {
      await this.store.run('logoutEverywhere');
    }
  }
}
