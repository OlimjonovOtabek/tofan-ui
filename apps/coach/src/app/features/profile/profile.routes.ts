import { Routes } from '@angular/router';
import {
  canDeactivateCoachProfile,
  CoachProfilePage,
} from './pages/coach-profile-page/coach-profile-page';

export const PROFILE_ROUTES: Routes = [
  { path: '', component: CoachProfilePage, canDeactivate: [canDeactivateCoachProfile] },
];
