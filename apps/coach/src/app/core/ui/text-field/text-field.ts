import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-name';

export type TextFieldType = 'text' | 'password' | 'email' | 'url' | 'search';

let nextFieldId = 0;

@Component({
  selector: 'coach-text-field',
  imports: [Icon, TranslatePipe],
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
  host: { '[class.is-disabled]': 'disabled()' },
})
export class TextField implements FormValueControl<string> {
  private readonly translator = inject(Translator);

  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touch = output<void>();
  readonly submitted = output<void>();

  readonly title = input<string | null>(null);
  readonly markRequired = input(false);
  readonly hint = input('');
  readonly caption = input<string | null>(null);
  readonly fieldError = input<string | null>(null);
  readonly suffix = input<string | null>(null);
  readonly leadingIcon = input<IconName | null>(null);
  readonly type = input<TextFieldType>('text');
  readonly inputMode = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly allowed = input<RegExp | null>(null);
  readonly rows = input(0);
  readonly maxLength = input<number | undefined>(undefined);
  readonly showCounter = input(false);
  readonly clearable = input(true);
  readonly small = input(false);
  readonly autofocus = input(false);
  readonly ariaLabel = input<string | null>(null);

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  protected readonly fieldId = `coach-field-${nextFieldId++}`;
  protected readonly focused = signal(false);
  protected readonly revealed = signal(false);
  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type(),
  );
  protected readonly canClear = computed(
    () =>
      this.clearable() && this.type() !== 'password' && this.focused() && this.value().length > 0,
  );
  protected readonly error = computed(() => {
    const forced = this.fieldError();
    if (forced !== null) {
      return forced;
    }
    if (!this.touched() || !this.invalid()) {
      return null;
    }
    const message = this.errors().find((error) => error.message !== undefined)?.message;
    return message === undefined ? null : this.translator.message(message);
  });

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) {
        this.field()?.nativeElement.focus();
      }
    });
  }

  protected typed(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }
    const pattern = this.allowed();
    const text =
      pattern === null
        ? target.value
        : [...target.value].filter((char) => pattern.test(char)).join('');
    if (text !== target.value) {
      target.value = text;
    }
    this.value.set(text);
  }

  protected blurred(): void {
    this.focused.set(false);
    this.touch.emit();
  }

  protected clear(): void {
    this.value.set('');
  }
}
