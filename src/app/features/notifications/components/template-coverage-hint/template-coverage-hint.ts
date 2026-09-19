import { Component, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { RouterLink } from '@angular/router';
import { Message } from '@openng/optimus-ui/message';
import { TrainerStyle } from '../../models/notification-attributes';
import { TRAINER_STYLE_LABELS } from '../../models/notification-labels';
import { NotificationTemplate } from '../../models/notification-template';
import { TemplateCoverage } from '../../models/template-coverage';

@Component({
  selector: 'app-template-coverage-hint',
  imports: [RouterLink, Message, TranslatePipe],
  templateUrl: './template-coverage-hint.html',
})
export class TemplateCoverageHint {
  private readonly translator = inject(Translator);

  readonly coverage = input.required<TemplateCoverage>();
  readonly preview = input<NotificationTemplate | null>(null);
  readonly templatesPath = input.required<string>();

  protected readonly locale = inject(LocaleStore).locale;

  protected styleLabels(styles: readonly TrainerStyle[]): string {
    return styles.map((style) => this.translator.translate(TRAINER_STYLE_LABELS[style])).join(', ');
  }
}
