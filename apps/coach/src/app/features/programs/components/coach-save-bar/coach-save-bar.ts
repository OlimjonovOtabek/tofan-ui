import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-save-bar',
  imports: [ButtonDirective, TranslatePipe],
  templateUrl: './coach-save-bar.html',
  styleUrl: './coach-save-bar.css',
})
export class CoachSaveBar {
  readonly dirty = input.required<boolean>();
  readonly saving = input.required<boolean>();
  readonly saveRequested = output<void>();
  readonly discardRequested = output<void>();
}
