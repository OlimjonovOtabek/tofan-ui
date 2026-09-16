import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '@environments/environment';
import { routes } from './app.routes';
import { provideAuth } from './di/auth.providers';
import { provideExercises } from './di/exercises.providers';
import { provideFoods } from './di/foods.providers';
import { provideHttp } from './di/http.providers';
import { provideStorage } from './di/storage.providers';
import { provideUi } from './di/ui.providers';

/** Composition root: the only place where all layers are wired together. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttp(environment.apiBaseUrl),
    provideAuth({ useMockApi: environment.useMockApi }),
    provideStorage({ useMockApi: environment.useMockApi }),
    provideExercises({ useMockApi: environment.useMockApi }),
    provideFoods({ useMockApi: environment.useMockApi }),
    provideUi(),
  ],
};
