import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.dashboard.title'), component: DashboardPage },
];
