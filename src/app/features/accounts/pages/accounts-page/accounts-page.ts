import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { Tag } from '@openng/optimus-ui/tag';
import { formatDateTime } from '@core/i18n/date-format';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AccountsStore } from '../../accounts.store';
import { AccountFilters } from '../../components/account-filters/account-filters';
import { Account } from '../../models/account';
import { AccountFilter } from '../../models/account-filter';

@Component({
  selector: 'app-accounts-page',
  imports: [DataTable, AccountFilters, RouterLink, Tag, TranslatePipe],
  providers: [AccountsStore],
  templateUrl: './accounts-page.html',
})
export class AccountsPage {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(AccountsStore);

  protected readonly accountsPath = AppPaths.accounts;

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    { field: 'userName', header: this.header('accounts.list.columns.userName') },
    { field: 'email', header: this.header('accounts.list.columns.email') },
    { field: 'phoneNumber', header: this.header('accounts.list.columns.phone'), width: '11rem' },
    {
      field: 'registeredOnUtc',
      header: this.header('accounts.list.columns.registered'),
      width: '12rem',
    },
    { field: 'isActive', header: this.header('accounts.list.columns.status'), width: '9rem' },
  ]);

  protected registeredLabel(account: Account): string {
    return formatDateTime(account.registeredAt, this.localeStore.locale());
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: AccountFilter): void {
    void this.store.applyFilter(filter);
  }

  private header(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
