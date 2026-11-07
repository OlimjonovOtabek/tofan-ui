import { CDK_DRAG_CONFIG, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { FieldTree, FormField, form } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { TextField } from '@shared/components/text-field/text-field';
import { BENEFITS_MAX_COUNT, Benefit, canAddBenefit, moveBenefit } from '@shared/models/benefit';
import {
  BenefitRow,
  BenefitsFormValue,
  benefitsFormSchema,
  emptyBenefitRow,
  toBenefitRows,
  toBenefits,
} from './benefits.schema';

const DRAG_PREVIEW_Z_INDEX = 2000;

type BenefitLanguage = keyof Omit<BenefitRow, 'key'>;

type MoveDirection = 'up' | 'down';

interface LanguageField {
  readonly field: BenefitLanguage;
  readonly label: TranslationKey;
}

const LANGUAGE_FIELDS: readonly LanguageField[] = [
  { field: 'en', label: 'common.benefits.languages.en' },
  { field: 'ru', label: 'common.benefits.languages.ru' },
  { field: 'uz', label: 'common.benefits.languages.uz' },
];

@Component({
  selector: 'app-benefits-dialog',
  imports: [
    DragDropModule,
    FormField,
    Button,
    Message,
    FieldError,
    FormDialog,
    TextField,
    TranslatePipe,
  ],
  providers: [{ provide: CDK_DRAG_CONFIG, useValue: { zIndex: DRAG_PREVIEW_Z_INDEX } }],
  templateUrl: './benefits-dialog.html',
})
export class BenefitsDialog {
  readonly visible = model.required<boolean>();
  readonly header = input.required<string>();
  readonly benefits = input<readonly Benefit[]>([]);
  readonly saving = input(false);

  readonly save = output<readonly Benefit[]>();

  protected readonly value = signal<BenefitsFormValue>({ rows: [] });
  protected readonly form = form(this.value, benefitsFormSchema);
  protected readonly languages = LANGUAGE_FIELDS;
  protected readonly maxCount = BENEFITS_MAX_COUNT;
  protected readonly rows = computed(() => this.value().rows);
  protected readonly count = computed(() => this.rows().length);
  protected readonly canAdd = computed(() => canAddBenefit(this.count()));

  private readonly injector = inject(Injector);
  private readonly moveUpButtons = viewChildren<unknown, ElementRef<HTMLElement>>('moveUp', {
    read: ElementRef,
  });
  private readonly moveDownButtons = viewChildren<unknown, ElementRef<HTMLElement>>('moveDown', {
    read: ElementRef,
  });
  private nextKey = 0;

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.prepare());
      }
    });
  }

  protected add(): void {
    this.value.update((current) => ({ rows: [...current.rows, emptyBenefitRow(this.newKey())] }));
  }

  protected remove(index: number): void {
    this.value.update((current) => ({ rows: current.rows.filter((_, at) => at !== index) }));
  }

  protected move(from: number, to: number): void {
    this.value.update((current) => ({ rows: moveBenefit(current.rows, from, to) }));
  }

  protected moveByButton(from: number, direction: MoveDirection): void {
    const to = direction === 'up' ? from - 1 : from + 1;
    this.move(from, to);
    afterNextRender(() => this.focusMoveButton(to, direction), { injector: this.injector });
  }

  protected drop(event: CdkDragDrop<readonly BenefitRow[]>): void {
    this.move(event.previousIndex, event.currentIndex);
  }

  protected submit(): void {
    this.form().markAsTouched();
    if (this.form().invalid()) {
      this.revealFirstInvalidField();
      return;
    }
    this.save.emit(toBenefits(this.rows()));
  }

  private focusMoveButton(index: number, direction: MoveDirection): void {
    const enabled = this.enabledDirection(index, direction);
    const buttons = enabled === 'up' ? this.moveUpButtons() : this.moveDownButtons();
    buttons[index]?.nativeElement.querySelector('button')?.focus();
  }

  private enabledDirection(index: number, direction: MoveDirection): MoveDirection {
    if (direction === 'up') {
      return index === 0 ? 'down' : 'up';
    }
    return index === this.count() - 1 ? 'up' : 'down';
  }

  private revealFirstInvalidField(): void {
    const field = this.firstInvalidField();
    if (field === undefined) {
      return;
    }
    field().formFieldBindings()[0]?.element.scrollIntoView({ block: 'center' });
    field().focusBoundControl({ preventScroll: true });
  }

  private firstInvalidField(): FieldTree<string, string> | undefined {
    for (const row of this.form.rows) {
      const invalid = this.languages
        .map(({ field }) => row[field])
        .find((field) => field().invalid());
      if (invalid !== undefined) {
        return invalid;
      }
    }
    return undefined;
  }

  private prepare(): void {
    this.form().reset({ rows: toBenefitRows(this.benefits(), () => this.newKey()) });
  }

  private newKey(): string {
    this.nextKey += 1;
    return `benefit-${this.nextKey}`;
  }
}
