import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { ExercisesPage } from '@presentation/pages/exercises/exercises-page';
import { provideExercises } from '../di/exercises.providers';
import { provideStorage } from '../di/storage.providers';

/** Lazy feature root: the catalog's adapters load with the page, not with the app shell. */
export const EXERCISE_ROUTES: Routes = [
  {
    path: '',
    title: 'Mashqlar katalogi',
    // The video field of the form uploads through Storage.
    providers: [
      provideExercises({ useMockApi: environment.useMockApi }),
      provideStorage({ useMockApi: environment.useMockApi }),
    ],
    component: ExercisesPage,
  },
];
