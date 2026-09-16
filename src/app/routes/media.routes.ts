import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { MediaPage } from '@presentation/pages/media/media-page';
import { provideExercises } from '../di/exercises.providers';
import { provideStorage } from '../di/storage.providers';

/** Lazy feature root. Exercises are provided too: a delete first looks for videos in use. */
export const MEDIA_ROUTES: Routes = [
  {
    path: '',
    title: 'Media fayllar',
    providers: [
      provideStorage({ useMockApi: environment.useMockApi }),
      provideExercises({ useMockApi: environment.useMockApi }),
    ],
    component: MediaPage,
  },
];
