import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export interface Swatch {
  readonly name: string;
  readonly title: string;
  readonly color: string;
}

@Component({
  selector: 'app-swatch-picker',
  imports: [FormsModule, Checkbox, TranslatePipe],
  templateUrl: './swatch-picker.html',
  host: { class: 'flex flex-col gap-2' },
})
export class SwatchPicker {
  readonly label = input.required<TranslationKey>();
  readonly swatches = input.required<readonly Swatch[]>();
  readonly strongSwatches = input<readonly Swatch[]>([]);
  readonly selected = input.required<string | null>();
  readonly allowDefault = input(false);
  readonly matte = input<boolean | null>(null);
  readonly matteId = input('');

  readonly picked = output<string | null>();
  readonly matteChange = output<boolean>();

  protected readonly rows = computed(() =>
    [this.swatches(), this.strongSwatches()].filter((row) => row.length > 0),
  );

  protected choose(event: Event, name: string | null): void {
    event.stopPropagation();
    this.picked.emit(name);
  }
}
