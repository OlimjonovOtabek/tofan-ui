import { Routes } from '@angular/router';
import { CoachClientDetailPage } from './pages/coach-client-detail-page/coach-client-detail-page';
import { CoachClientsPage } from './pages/coach-clients-page/coach-clients-page';

export const CLIENT_ROUTES: Routes = [
  { path: '', component: CoachClientsPage },
  { path: ':userId', component: CoachClientDetailPage },
];
