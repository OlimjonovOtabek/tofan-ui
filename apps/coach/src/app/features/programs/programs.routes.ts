import { pageTitle } from '@core/i18n/page-title';
import { Routes } from '@angular/router';
import {
  canDeactivateMealEditor,
  CoachMealEditorPage,
} from './pages/coach-meal-editor-page/coach-meal-editor-page';
import { CoachProgramsPage } from './pages/coach-programs-page/coach-programs-page';
import {
  canDeactivateWorkoutEditor,
  CoachWorkoutEditorPage,
} from './pages/coach-workout-editor-page/coach-workout-editor-page';

export const PROGRAM_ROUTES: Routes = [
  { path: '', title: pageTitle('coach.titles.programs'), component: CoachProgramsPage },
  {
    path: 'workout/:id',
    title: pageTitle('coach.titles.workoutEditor'),
    component: CoachWorkoutEditorPage,
    canDeactivate: [canDeactivateWorkoutEditor],
  },
  {
    path: 'meal/:id',
    title: pageTitle('coach.titles.mealEditor'),
    component: CoachMealEditorPage,
    canDeactivate: [canDeactivateMealEditor],
  },
];
