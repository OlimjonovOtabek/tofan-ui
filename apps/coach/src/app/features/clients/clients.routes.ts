import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { ClientDetailPage } from './pages/client-detail-page/client-detail-page';
import { ClientsPage } from './pages/clients-page/clients-page';

export const CLIENT_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.clients.title'), component: ClientsPage },
  {
    path: ':userId',
    title: pageTitle('coachApp.clientDetail.title'),
    data: { [PUSHED_ROUTE]: true },
    component: ClientDetailPage,
  },
];
