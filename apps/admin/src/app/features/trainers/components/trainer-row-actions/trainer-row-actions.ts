import { Component, input, output } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Trainer } from '../../models/trainer';

@Component({
  selector: 'app-trainer-row-actions',
  imports: [Button, Tooltip, TranslatePipe],
  templateUrl: './trainer-row-actions.html',
})
export class TrainerRowActions {
  readonly trainer = input.required<Trainer>();

  readonly edit = output<void>();
  readonly changePassword = output<void>();
  readonly changeCommission = output<void>();
  readonly grant = output<void>();
  readonly publish = output<void>();
  readonly unpublish = output<void>();
  readonly remove = output<void>();
}
