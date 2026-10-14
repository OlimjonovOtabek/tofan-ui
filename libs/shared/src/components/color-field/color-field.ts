import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { isHexColor } from '@shared/utils/hex-color';
import { ColorPicker } from '@openng/optimus-ui/colorpicker';
import { InputText } from '@openng/optimus-ui/inputtext';

const HEX_COLOR_LENGTH = 7;
const EMPTY_PICKER_COLOR = 'ffffff';

@Component({
  selector: 'app-color-field',
  imports: [FormsModule, ColorPicker, InputText],
  template: `
    <div class="flex items-center gap-2">
      <span class="border-surface-300 dark:border-surface-600 inline-flex rounded-md border p-0.5">
        <p-colorpicker
          format="hex"
          [defaultColor]="emptyColor"
          [ngModel]="pickerValue()"
          [disabled]="disabled()"
          (ngModelChange)="value.set($event)"
          (onHide)="touch.emit()"
        />
      </span>
      <input
        pInputText
        type="text"
        class="min-w-0 flex-1 font-mono uppercase"
        autocomplete="off"
        [id]="inputId()"
        [value]="value()"
        [placeholder]="placeholder()"
        [maxLength]="codeLength"
        [disabled]="disabled()"
        [invalid]="invalid() && touched()"
        (input)="type($event)"
        (blur)="touch.emit()"
      />
    </div>
  `,
})
export class ColorField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly placeholder = input('#000000');

  protected readonly codeLength = HEX_COLOR_LENGTH;
  protected readonly emptyColor = EMPTY_PICKER_COLOR;
  protected readonly pickerValue = computed(() => {
    const value = this.value();
    return isHexColor(value) ? value : null;
  });

  protected type(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value.trim());
    }
  }
}
