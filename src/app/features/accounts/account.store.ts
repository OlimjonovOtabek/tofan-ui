import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { Roles } from '@core/auth/roles';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { Account } from './models/account';
import { AccountsService } from './services/accounts.service';

export type AccountAction = 'block' | 'unblock' | 'logoutEverywhere';

const SUCCESS_MESSAGES: Record<AccountAction, TranslationKey> = {
  block: 'accounts.done.block',
  unblock: 'accounts.done.unblock',
  logoutEverywhere: 'accounts.done.logoutEverywhere',
};

@Injectable()
export class AccountStore {
  private readonly accountsService = inject(AccountsService);
  private readonly notifications = inject(NotificationService);
  private readonly authStore = inject(AuthStore);

  private readonly currentId = signal<string | null>(null);
  private readonly requests: Record<AccountAction, (id: string) => Promise<void>> = {
    block: (id) => this.accountsService.block(id),
    unblock: (id) => this.accountsService.unblock(id),
    logoutEverywhere: (id) => this.accountsService.logoutEverywhere(id),
  };

  readonly account = signal<Account | null>(null);
  readonly roles = signal<readonly string[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly runningAction = signal<AccountAction | null>(null);

  readonly isAdmin = computed(() => this.roles().includes(Roles.admin));
  readonly isCurrentUser = computed(
    () => this.account() !== null && this.account()?.id === this.authStore.currentUser()?.id,
  );

  async load(id: string | null = this.currentId()): Promise<void> {
    if (id === null) {
      return;
    }
    this.currentId.set(id);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const [account, roles] = await Promise.all([
        this.accountsService.getById(id),
        this.accountsService.getRoles(id),
      ]);
      this.account.set(account);
      this.roles.set(roles);
    } catch (error) {
      this.account.set(null);
      this.roles.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async run(action: AccountAction): Promise<void> {
    const account = this.account();
    if (account === null) {
      return;
    }
    this.runningAction.set(action);
    try {
      await this.requests[action](account.id);
      this.notifications.success(SUCCESS_MESSAGES[action]);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.runningAction.set(null);
    }
    await this.load();
  }
}
