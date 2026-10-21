import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from '@openng/optimus-ui/button';

@Component({
  selector: 'app-garments-toolbar',
  imports: [
    CatalogHeader,
    Button,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './garments-toolbar.html',
})
export class GarmentsToolbar {
  readonly count = input<number | null>(null);
  readonly exporting = input(false);

  readonly exportLinks = output<void>();
  readonly add = output<void>();

  protected readonly dropsPath = AppPaths.garmentDrops;
}
