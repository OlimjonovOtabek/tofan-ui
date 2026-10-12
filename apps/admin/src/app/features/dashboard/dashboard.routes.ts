import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.dashboard'), component: DashboardPage },
];
