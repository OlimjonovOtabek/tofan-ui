import { Routes } from '@angular/router';
import { AccountPage } from './pages/account-page/account-page';
import { AccountsPage } from './pages/accounts-page/accounts-page';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', title: 'Hisoblar', component: AccountsPage },
  { path: ':userId', title: 'Hisob', component: AccountPage },
];
