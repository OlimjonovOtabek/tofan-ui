import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { Password } from '@openng/optimus-ui/password';

@Component({
  selector: 'app-password-field',
  imports: [FormsModule, Password],
  template: `
    <p-password
      [inputId]="inputId()"
      [(ngModel)]="value"
      [placeholder]="placeholder()"
      [autocomplete]="autocomplete()"
      [toggleMask]="true"
      [feedback]="false"
      [fluid]="true"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (onBlur)="touch.emit()"
    />
  `,
})
export class PasswordField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly placeholder = input<string>();
  readonly autocomplete = input<string>();
}
