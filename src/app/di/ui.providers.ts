import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { TitleStrategy } from '@angular/router';
import Aura from '@openng/optimus-ui-themes/aura';
import { ThemeService } from '@presentation/layout/theme/theme.service';
import { AppTitleStrategy } from '@presentation/routing/app-title.strategy';
import { provideOptimus } from '@openng/optimus-ui/config';

export function provideUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideOptimus({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
    }),
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ]);
}
