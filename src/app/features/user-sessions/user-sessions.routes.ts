import { Routes } from '@angular/router';
import { UserSessionsPage } from './pages/user-sessions-page/user-sessions-page';

export const USER_SESSION_ROUTES: Routes = [
  { path: '', title: 'Kirishlar jurnali', component: UserSessionsPage },
];
