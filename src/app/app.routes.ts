import { Routes } from '@angular/router';
import { Layout } from '@presentation/layout/components/layout/layout';
import { authGuard } from '@presentation/routing/guards/auth.guard';
import { guestGuard } from '@presentation/routing/guards/guest.guard';

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
          import('@presentation/pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'foods',
        title: 'Ovqatlar katalogi',
        loadComponent: () =>
          import('@presentation/pages/foods/foods-page').then((m) => m.FoodsPage),
      },
      {
        path: 'exercises',
        title: 'Mashqlar katalogi',
        loadComponent: () =>
          import('@presentation/pages/exercises/exercises-page').then((m) => m.ExercisesPage),
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
          import('@presentation/pages/auth/login/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'access-denied',
        title: "Ruxsat yo'q",
        loadComponent: () =>
          import('@presentation/pages/auth/access-denied/access-denied-page').then(
            (m) => m.AccessDeniedPage,
          ),
      },
      {
        path: 'error',
        title: 'Xatolik',
        loadComponent: () =>
          import('@presentation/pages/auth/error/error-page').then((m) => m.ErrorPage),
      },
    ],
  },
  {
    path: 'not-found',
    title: 'Sahifa topilmadi',
    loadComponent: () =>
      import('@presentation/pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: 'not-found' },
];
