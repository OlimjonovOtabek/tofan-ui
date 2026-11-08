import { Component, input, linkedSignal, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { AutoComplete } from '@openng/optimus-ui/autocomplete';
import { SoldierOption } from '@shared/models/soldier-option';

type SoldierEntry = SoldierOption | string | null;

function isSoldierOption(candidate: unknown): candidate is SoldierOption {
  return typeof candidate === 'object' && candidate !== null && 'userId' in candidate;
}

function entryForValue(userId: string | null, entry: SoldierEntry): SoldierEntry {
  if (userId === null) {
    return typeof entry === 'string' ? entry : null;
  }
  return isSoldierOption(entry) && entry.userId === userId ? entry : null;
}

@Component({
  selector: 'app-soldier-field',
  imports: [FormsModule, AutoComplete],
  templateUrl: './soldier-field.html',
})
export class SoldierField implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly placeholder = input('');
  readonly emptyMessage = input('');
  readonly options = input.required<readonly SoldierOption[]>();

  readonly searchChange = output<string>();

  protected readonly entry = linkedSignal<string | null, SoldierEntry>({
    source: this.value,
    computation: (userId, previous) => entryForValue(userId, previous?.value ?? null),
  });

  protected change(entry: SoldierEntry): void {
    this.entry.set(entry);
    this.value.set(isSoldierOption(entry) ? entry.userId : null);
  }

  protected search(query: string): void {
    this.searchChange.emit(query);
  }
}
