import { Component, input, model, output } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';

/**
 * Modal shell for create/edit forms: the caller projects the fields and reacts to `(save)`,
 * while the dialog owns the header, footer buttons and the busy state.
 */
@Component({
  selector: 'app-form-dialog',
  imports: [Dialog, Button],
  templateUrl: './form-dialog.html',
})
export class FormDialog {
  readonly visible = model.required<boolean>();
  readonly header = input.required<string>();
  readonly saving = input(false);
  readonly saveLabel = input('Saqlash');
  readonly saveDisabled = input(false);
  readonly width = input('32rem');

  readonly save = output<void>();

  protected close(): void {
    this.visible.set(false);
  }
}
