import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { CoachAccessDeniedPage } from './pages/coach-access-denied-page/coach-access-denied-page';
import { CoachLoginPage } from './pages/coach-login-page/coach-login-page';
import { CoachOnboardingPage } from './pages/coach-onboarding-page/coach-onboarding-page';

export const AUTH_ROUTES: Routes = [
  { path: 'login', title: pageTitle('coachApp.titles.login'), component: CoachLoginPage },
  {
    path: 'access-denied',
    title: pageTitle('coachApp.titles.accessDenied'),
    component: CoachAccessDeniedPage,
  },
];

export const ONBOARDING_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.titles.onboarding'), component: CoachOnboardingPage },
];
