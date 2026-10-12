import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-content-header',
  imports: [ButtonDirective, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './coach-content-header.html',
  styleUrl: './coach-content-header.css',
})
export class CoachContentHeader {
  readonly createLabel = input.required<TranslationKey>();
  readonly busy = input(false);
  readonly create = output<void>();
}
