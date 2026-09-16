import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { UserSessionsPage } from '@presentation/pages/user-sessions/user-sessions-page';
import { provideUserSessions } from '../di/user-sessions.providers';

/** Lazy feature root: the journal's adapter loads with the page, not with the app shell. */
export const USER_SESSION_ROUTES: Routes = [
  {
    path: '',
    title: 'Kirishlar jurnali',
    providers: [provideUserSessions({ useMockApi: environment.useMockApi })],
    component: UserSessionsPage,
  },
];
