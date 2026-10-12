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
  { path: '', component: CoachProgramsPage },
  {
    path: 'workout/:id',
    component: CoachWorkoutEditorPage,
    canDeactivate: [canDeactivateWorkoutEditor],
  },
  { path: 'meal/:id', component: CoachMealEditorPage, canDeactivate: [canDeactivateMealEditor] },
];
