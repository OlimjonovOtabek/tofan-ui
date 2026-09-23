import { Component, input, model, output } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-form-dialog',
  imports: [Dialog, Button, TranslatePipe],
  templateUrl: './form-dialog.html',
})
export class FormDialog {
  readonly visible = model.required<boolean>();
  readonly header = input.required<string>();
  readonly saving = input(false);
  readonly saveLabel = input<string | null>(null);
  readonly cancelLabel = input<string | null>(null);
  readonly saveDisabled = input(false);
  readonly width = input('32rem');

  readonly save = output<void>();

  protected submit(event: Event): void {
    event.preventDefault();
    this.save.emit();
  }

  protected close(): void {
    this.visible.set(false);
  }
}
