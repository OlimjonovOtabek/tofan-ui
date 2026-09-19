import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '@environments/environment';
import { routes } from './routes/app.routes';
import { provideHttp } from '@core/http/http.providers';
import { provideUi } from '@core/config/ui.providers';
import { provideI18n } from '@core/i18n/i18n.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttp(environment.apiBaseUrl),
    provideUi(),
    provideI18n(),
  ],
};
