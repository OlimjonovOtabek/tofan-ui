import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { AccountPage } from './pages/account-page/account-page';
import { AccountsPage } from './pages/accounts-page/accounts-page';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.accounts'), component: AccountsPage },
  { path: ':userId', title: pageTitle('layout.titles.account'), component: AccountPage },
];
