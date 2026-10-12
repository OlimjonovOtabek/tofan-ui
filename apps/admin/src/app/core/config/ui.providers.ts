import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { TitleStrategy } from '@angular/router';
import Aura from '@openng/optimus-ui-themes/aura';
import { ThemeService } from '@core/layout/theme/theme.service';
import { AppTitleStrategy } from './app-title.strategy';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';

export function provideUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideOptimus({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      overlayAppendTo: 'body',
    }),
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    MessageService,
    ConfirmationService,
  ]);
}
