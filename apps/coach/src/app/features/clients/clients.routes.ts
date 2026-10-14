import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { CoachClientDetailPage } from './pages/coach-client-detail-page/coach-client-detail-page';
import { CoachClientsPage } from './pages/coach-clients-page/coach-clients-page';

export const CLIENT_ROUTES: Routes = [
  { path: '', title: pageTitle('coach.titles.clients'), component: CoachClientsPage },
  { path: ':userId', title: pageTitle('coach.titles.client'), component: CoachClientDetailPage },
];
