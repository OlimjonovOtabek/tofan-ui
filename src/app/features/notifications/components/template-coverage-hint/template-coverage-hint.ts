import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Message } from '@openng/optimus-ui/message';
import { TrainerStyle } from '../../models/notification-attributes';
import { TRAINER_STYLE_LABELS } from '../../models/notification-labels';
import { NotificationTemplate } from '../../models/notification-template';
import { TemplateCoverage } from '../../models/template-coverage';

@Component({
  selector: 'app-template-coverage-hint',
  imports: [RouterLink, Message],
  templateUrl: './template-coverage-hint.html',
})
export class TemplateCoverageHint {
  readonly coverage = input.required<TemplateCoverage>();
  readonly preview = input<NotificationTemplate | null>(null);
  readonly templatesPath = input.required<string>();

  protected styleLabels(styles: readonly TrainerStyle[]): string {
    return styles.map((style) => TRAINER_STYLE_LABELS[style]).join(', ');
  }
}
