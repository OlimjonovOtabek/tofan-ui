import { Component, inject, input } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TranslatePipe } from '@core/i18n/translate.pipe';

export interface DataEntryControls {
  key: FormControl<string>;
  value: FormControl<string>;
}

@Component({
  selector: 'app-notification-data-entries',
  imports: [ReactiveFormsModule, Button, InputText, TranslatePipe],
  templateUrl: './notification-data-entries.html',
})
export class NotificationDataEntries {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly entries = input.required<FormArray<FormGroup<DataEntryControls>>>();

  protected add(): void {
    this.entries().push(
      this.formBuilder.group({
        key: this.formBuilder.control(''),
        value: this.formBuilder.control(''),
      }),
    );
  }

  protected remove(index: number): void {
    this.entries().removeAt(index);
  }
}
