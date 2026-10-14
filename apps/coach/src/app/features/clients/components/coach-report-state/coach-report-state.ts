import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { ErrorMessage } from '@core/feedback/error-message';
import { TranslationKey } from '@core/i18n/dictionary';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-report-state',
  imports: [ButtonDirective, MessagePipe, TranslatePipe],
  templateUrl: './coach-report-state.html',
  styleUrl: './coach-report-state.css',
})
export class CoachReportState {
  readonly error = input<ErrorMessage | null>(null);
  readonly icon = input('pi pi-inbox');
  readonly title = input.required<TranslationKey>();
  readonly hint = input.required<TranslationKey>();
  readonly retry = output<void>();
}
