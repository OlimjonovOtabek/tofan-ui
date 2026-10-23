import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './routes/app.routes';
import { provideHttp } from '@core/http/http.providers';
import { provideI18n } from '@core/i18n/i18n.providers';
import { provideAppTitle } from '@core/i18n/app-title.strategy';
import { REQUIRED_LOGIN_ROLE } from '@core/auth/required-login-role';
import { Roles } from '@core/auth/roles';
import { environment } from '@coach-environments/environment';
import { provideOptimus } from '@openng/optimus-ui/config';
import { COACH_THEME } from './core/layout/coach-theme';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';

const APP_NAME = 'Tofan Coach';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttp(environment.apiBaseUrl),
    provideOptimus({
      theme: { preset: COACH_THEME, options: { darkModeSelector: '.app-dark' } },
      overlayAppendTo: 'body',
    }),
    provideI18n(),
    provideAppTitle(APP_NAME),
    MessageService,
    ConfirmationService,
    { provide: REQUIRED_LOGIN_ROLE, useValue: Roles.trainer },
  ],
};
