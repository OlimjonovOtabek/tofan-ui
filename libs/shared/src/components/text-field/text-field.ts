import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { InputText } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'app-text-field',
  imports: [InputText],
  template: `
    <input
      pInputText
      [type]="type()"
      class="w-full"
      [id]="inputId()"
      [value]="value()"
      [placeholder]="placeholder() ?? ''"
      [attr.autocomplete]="autocomplete()"
      [disabled]="disabled()"
      [invalid]="invalid() && touched()"
      (input)="typed($event)"
      (blur)="touch.emit()"
    />
  `,
})
export class TextField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly type = input<'text' | 'password'>('text');
  readonly inputId = input<string>();
  readonly placeholder = input<string>();
  readonly autocomplete = input<string>();

  protected typed(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value);
    }
  }
}
