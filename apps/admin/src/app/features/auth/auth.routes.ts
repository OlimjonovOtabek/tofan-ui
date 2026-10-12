import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/guest.guard';
import { AccessDeniedPage } from './pages/access-denied-page/access-denied-page';
import { ErrorPage } from './pages/error-page/error-page';
import { LoginPage } from './pages/login-page/login-page';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    title: pageTitle('layout.titles.login'),
    canActivate: [guestGuard],
    component: LoginPage,
  },
  {
    path: 'access-denied',
    title: pageTitle('layout.titles.accessDenied'),
    component: AccessDeniedPage,
  },
  { path: 'error', title: pageTitle('layout.titles.error'), component: ErrorPage },
];
