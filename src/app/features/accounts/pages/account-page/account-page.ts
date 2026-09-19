import { Component, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import {
  Button,
  ButtonDirective,
  ButtonIcon,
  ButtonLabel,
} from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { Tag } from '@openng/optimus-ui/tag';
import { AccountStore } from '../../account.store';
import { Account } from '../../models/account';

const TOKEN_LIFETIME_NOTE =
  'Foydalanuvchining qo‘lidagi access token muddati tugaguncha API’dan foydalanishi mumkin.';

@Component({
  selector: 'app-account-page',
  imports: [RouterLink, Button, ButtonDirective, ButtonIcon, ButtonLabel, Message, Tag],
  providers: [AccountStore],
  templateUrl: './account-page.html',
})
export class AccountPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly clipboard = inject(ClipboardService);

  protected readonly store = inject(AccountStore);

  protected readonly accountsPath = AppPaths.accounts;
  protected readonly soldiersPath = AppPaths.soldiers;
  protected readonly userSessionsPath = AppPaths.userSessions;
  protected readonly sendNotificationPath = AppPaths.sendNotification;
  protected readonly tokenLifetimeNote = TOKEN_LIFETIME_NOTE;

  readonly userId = input.required<string>();

  constructor() {
    effect(() => {
      const userId = this.userId();
      untracked(() => void this.store.load(userId));
    });
  }

  protected registeredLabel(account: Account): string {
    return account.registeredAt.toLocaleString('uz-UZ', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  protected copyId(account: Account): Promise<void> {
    return this.clipboard.copy(account.id, 'Foydalanuvchi ID');
  }

  protected async block(account: Account): Promise<void> {
    const adminWarning = this.store.isAdmin() ? 'Diqqat: bu admin hisobi. ' : '';
    const confirmed = await this.confirmations.confirm(
      `${adminWarning}"${account.userName}" bloklansinmi? Akkaunt o‘chiriladi va hamma ` +
        `sessiyalari yopiladi. ${TOKEN_LIFETIME_NOTE}`,
      'Hisobni bloklash',
    );
    if (confirmed) {
      await this.store.run('block');
    }
  }

  protected async unblock(account: Account): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      `"${account.userName}" blokdan chiqarilsinmi? Sessiyalar tiklanmaydi — foydalanuvchi ` +
        'qaytadan kiradi.',
      'Blokdan chiqarish',
    );
    if (confirmed) {
      await this.store.run('unblock');
    }
  }

  protected async logoutEverywhere(account: Account): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      `"${account.userName}" hamma qurilmalardan chiqarilsinmi? Hisob holati o‘zgarmaydi. ` +
        TOKEN_LIFETIME_NOTE,
      'Hamma joydan chiqarish',
    );
    if (confirmed) {
      await this.store.run('logoutEverywhere');
    }
  }
}
