import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import Aura from '@openng/optimus-ui-themes/aura';
import { ThemeService } from '@core/layout/theme/theme.service';
import { provideAppTitle } from '@core/i18n/app-title.strategy';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';

const APP_NAME = 'Tofan Admin';

export function provideUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideOptimus({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      overlayAppendTo: 'body',
    }),
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    provideAppTitle(APP_NAME),
    MessageService,
    ConfirmationService,
  ]);
}
