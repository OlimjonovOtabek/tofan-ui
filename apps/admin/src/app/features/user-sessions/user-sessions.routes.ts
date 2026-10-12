import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { UserSessionsPage } from './pages/user-sessions-page/user-sessions-page';

export const USER_SESSION_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.userSessions'), component: UserSessionsPage },
];
