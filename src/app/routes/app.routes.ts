import { Routes } from '@angular/router';
import { Layout } from '@core/layout/components/layout/layout';
import { authGuard } from '@core/auth/auth.guard';
import { guestGuard } from '@core/auth/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        title: 'Boshqaruv paneli',
        loadComponent: () =>
          import('@features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'exercises',
        loadChildren: () =>
          import('@features/exercises/exercises.routes').then((m) => m.EXERCISE_ROUTES),
      },
      {
        path: 'foods',
        loadChildren: () => import('@features/foods/foods.routes').then((m) => m.FOOD_ROUTES),
      },
      {
        path: 'media',
        loadChildren: () => import('@features/media/media.routes').then((m) => m.MEDIA_ROUTES),
      },
      {
        path: 'user-sessions',
        loadChildren: () =>
          import('@features/user-sessions/user-sessions.routes').then((m) => m.USER_SESSION_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('@features/notifications/notifications.routes').then((m) => m.NOTIFICATION_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Kirish',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('@features/auth/login-page/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'access-denied',
        title: "Ruxsat yo'q",
        loadComponent: () =>
          import('@features/auth/access-denied-page/access-denied-page').then(
            (m) => m.AccessDeniedPage,
          ),
      },
      {
        path: 'error',
        title: 'Xatolik',
        loadComponent: () =>
          import('@features/auth/error-page/error-page').then((m) => m.ErrorPage),
      },
    ],
  },
  {
    path: 'not-found',
    title: 'Sahifa topilmadi',
    loadComponent: () => import('@features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: 'not-found' },
];
