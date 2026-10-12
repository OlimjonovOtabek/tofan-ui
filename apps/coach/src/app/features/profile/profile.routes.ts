import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import {
  canDeactivateCoachProfile,
  CoachProfilePage,
} from './pages/coach-profile-page/coach-profile-page';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    title: pageTitle('coach.titles.profile'),
    component: CoachProfilePage,
    canDeactivate: [canDeactivateCoachProfile],
  },
];
