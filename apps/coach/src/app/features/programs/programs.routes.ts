import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { MealProgramFormPage } from './pages/meal-program-form-page/meal-program-form-page';
import { MealProgramPage } from './pages/meal-program-page/meal-program-page';
import { ProgramsPage } from './pages/programs-page/programs-page';
import { WorkoutProgramFormPage } from './pages/workout-program-form-page/workout-program-form-page';
import { WorkoutProgramPage } from './pages/workout-program-page/workout-program-page';

export const PROGRAM_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.programs.title'), component: ProgramsPage },
  {
    path: 'workout/new',
    title: pageTitle('coachApp.createProgram.title'),
    data: { [PUSHED_ROUTE]: true },
    component: WorkoutProgramFormPage,
  },
  {
    path: 'workout/:id/edit',
    title: pageTitle('coachApp.workoutProgram.editDetails'),
    data: { [PUSHED_ROUTE]: true },
    component: WorkoutProgramFormPage,
  },
  {
    path: 'workout/:id',
    title: pageTitle('coachApp.workoutProgram.detailTitle'),
    data: { [PUSHED_ROUTE]: true },
    component: WorkoutProgramPage,
  },
  {
    path: 'meal/new',
    title: pageTitle('coachApp.createMeal.title'),
    data: { [PUSHED_ROUTE]: true },
    component: MealProgramFormPage,
  },
  {
    path: 'meal/:id/edit',
    title: pageTitle('coachApp.meal.programEditTitle'),
    data: { [PUSHED_ROUTE]: true },
    component: MealProgramFormPage,
  },
  {
    path: 'meal/:id',
    title: pageTitle('coachApp.meal.programDetailTitle'),
    data: { [PUSHED_ROUTE]: true },
    component: MealProgramPage,
  },
];
