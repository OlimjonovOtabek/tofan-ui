import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { Textarea } from '@openng/optimus-ui/textarea';

@Component({
  selector: 'app-textarea-field',
  imports: [FormsModule, Textarea],
  template: `
    <textarea
      pTextarea
      [id]="inputId()"
      [(ngModel)]="value"
      [ngModelOptions]="{ standalone: true }"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (blur)="touch.emit()"
    ></textarea>
  `,
})
export class TextareaField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();
  readonly inputId = input<string>();
  readonly rows = input(4);
  readonly placeholder = input('');
}
