import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { PageRequest } from '@shared/models/page';
import { Tag } from '@openng/optimus-ui/tag';
import { AccountsStore } from '../../accounts.store';
import { AccountFilters } from '../../components/account-filters/account-filters';
import { Account } from '../../models/account';
import { AccountFilter } from '../../models/account-filter';

@Component({
  selector: 'app-accounts-page',
  imports: [DataTable, AccountFilters, RouterLink, Tag],
  providers: [AccountsStore],
  templateUrl: './accounts-page.html',
})
export class AccountsPage {
  protected readonly store = inject(AccountsStore);

  protected readonly accountsPath = AppPaths.accounts;

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'userName', header: 'Username' },
    { field: 'email', header: 'Email' },
    { field: 'phoneNumber', header: 'Telefon', width: '11rem' },
    { field: 'registeredOnUtc', header: 'Ro‘yxatdan o‘tgan', width: '12rem' },
    { field: 'isActive', header: 'Holati', width: '9rem' },
  ];

  protected registeredLabel(account: Account): string {
    return account.registeredAt.toLocaleString('uz-UZ', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }

  protected applyFilter(filter: AccountFilter): void {
    void this.store.applyFilter(filter);
  }
}
