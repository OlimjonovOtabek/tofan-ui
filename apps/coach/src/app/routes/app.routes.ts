import { Routes } from '@angular/router';
import { coachGuard } from '@core/auth/coach.guard';
import { coachProfileGuard } from '@coach/core/auth/coach-profile.guard';
import { CoachShell } from '@coach/core/layout/coach-shell';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@coach/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'onboarding',
    canActivate: [coachGuard],
    loadChildren: () => import('@coach/features/auth/auth.routes').then((m) => m.ONBOARDING_ROUTES),
  },
  {
    path: '',
    component: CoachShell,
    canActivate: [coachGuard, coachProfileGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'programs' },
      {
        path: 'programs',
        loadChildren: () =>
          import('@coach/features/programs/programs.routes').then((m) => m.PROGRAM_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@coach/features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('@coach/features/clients/clients.routes').then((m) => m.CLIENT_ROUTES),
      },
      {
        path: 'content',
        loadChildren: () =>
          import('@coach/features/content/content.routes').then((m) => m.CONTENT_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'programs' },
];
