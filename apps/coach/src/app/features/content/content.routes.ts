import { Routes } from '@angular/router';
import {
  canDeactivateCoachExercises,
  CoachExercisesPage,
} from './pages/coach-exercises-page/coach-exercises-page';
import { CoachFoodsPage } from './pages/coach-foods-page/coach-foods-page';

export const CONTENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'exercises' },
  {
    path: 'exercises',
    component: CoachExercisesPage,
    canDeactivate: [canDeactivateCoachExercises],
  },
  { path: 'foods', component: CoachFoodsPage },
];
