import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import { ExercisesPage } from './pages/exercises-page/exercises-page';

export const EXERCISE_ROUTES: Routes = [
  { path: '', title: pageTitle('layout.titles.exercises'), component: ExercisesPage },
];
