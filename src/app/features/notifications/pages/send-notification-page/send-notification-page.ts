import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
  TrainerStyle,
} from '../../models/notification-attributes';
import {
  NotificationDataEntry,
  createCustomNotification,
  createTemplatedNotification,
} from '../../models/outgoing-notification';
import { isUuid } from '@shared/utils/identifiers';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_OPTIONS,
  TRAINER_STYLE_LABELS,
} from '../../models/notification-labels';
import { NotificationSendStore } from '../../notification-send.store';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { AppPaths } from '@core/config/app-paths';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Message } from '@openng/optimus-ui/message';
import { Select } from '@openng/optimus-ui/select';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { Textarea } from '@openng/optimus-ui/textarea';

type SendMode = 'templated' | 'custom';

interface DataEntryControls {
  key: FormControl<string>;
  value: FormControl<string>;
}

const MODE_OPTIONS: { value: SendMode; label: string }[] = [
  { value: 'templated', label: 'Shablon asosida' },
  { value: 'custom', label: 'Maxsus matn' },
];

function uuidValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();
  return value.length === 0 || isUuid(value) ? null : { uuid: true };
}

@Component({
  selector: 'app-send-notification-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    InputText,
    Message,
    Select,
    SelectButton,
    Textarea,
  ],
  providers: [NotificationSendStore],
  templateUrl: './send-notification-page.html',
})
export class SendNotificationPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  protected readonly store = inject(NotificationSendStore);

  protected readonly modeOptions = MODE_OPTIONS;
  protected readonly typeOptions = NOTIFICATION_TYPE_OPTIONS;
  protected readonly titleMaxLength = NOTIFICATION_TITLE_MAX_LENGTH;
  protected readonly bodyMaxLength = NOTIFICATION_BODY_MAX_LENGTH;
  protected readonly templatesPath = AppPaths.notificationTemplates;

  protected readonly form = this.formBuilder.group({
    mode: this.formBuilder.control<SendMode>('templated'),
    userId: this.formBuilder.control('', [Validators.required, uuidValidator]),
    type: this.formBuilder.control<NotificationType>('workoutReminder', Validators.required),
    title: this.formBuilder.control('', Validators.maxLength(NOTIFICATION_TITLE_MAX_LENGTH)),
    body: this.formBuilder.control('', Validators.maxLength(NOTIFICATION_BODY_MAX_LENGTH)),
    data: this.formBuilder.array<FormGroup<DataEntryControls>>([]),
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly mode = computed(() => this.formValue().mode ?? 'templated');
  protected readonly type = computed(() => this.formValue().type ?? 'workoutReminder');
  protected readonly titleLength = computed(() => this.formValue().title?.length ?? 0);
  protected readonly bodyLength = computed(() => this.formValue().body?.length ?? 0);
  protected readonly coverage = computed(() => this.store.coverage(this.type()));
  protected readonly preview = computed(() => this.store.fallbackTemplate(this.type()));

  readonly userId = input<string>();

  constructor() {
    void this.store.loadTemplates();

    effect(() => {
      const userId = this.userId();
      if (userId !== undefined) {
        untracked(() => this.form.controls.userId.setValue(userId));
      }
    });
  }

  protected get dataEntries(): FormArray<FormGroup<DataEntryControls>> {
    return this.form.controls.data;
  }

  protected styleLabels(styles: readonly TrainerStyle[]): string {
    return styles.map((style) => TRAINER_STYLE_LABELS[style]).join(', ');
  }

  protected addDataEntry(): void {
    this.dataEntries.push(
      this.formBuilder.group({
        key: this.formBuilder.control(''),
        value: this.formBuilder.control(''),
      }),
    );
  }

  protected removeDataEntry(index: number): void {
    this.dataEntries.removeAt(index);
  }

  protected isInvalid(control: 'userId' | 'title' | 'body'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  protected isMissing(control: 'title' | 'body'): boolean {
    const field = this.form.controls[control];
    return this.mode() === 'custom' && field.touched && field.value.trim().length === 0;
  }

  protected async send(): Promise<void> {
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const customTextMissing =
      value.mode === 'custom' && (value.title.trim() === '' || value.body.trim() === '');
    if (this.form.invalid || customTextMissing) {
      return;
    }

    const data: NotificationDataEntry[] = value.data;
    const custom = {
      userId: value.userId,
      type: value.type,
      title: value.title,
      body: value.body,
      data,
    };
    const templated = { userId: value.userId, type: value.type, data };

    try {
      if (value.mode === 'custom') {
        createCustomNotification(custom);
      } else {
        createTemplatedNotification(templated);
      }
    } catch (error) {
      this.notifications.error(error);
      return;
    }

    const typeLabel = NOTIFICATION_TYPE_LABELS[value.type];
    const confirmed = await this.confirmations.confirm(
      `"${typeLabel}" turidagi push ${value.userId} foydalanuvchisining qurilmalariga hozir ` +
        'yuboriladi. Uni qaytarib olib bo‘lmaydi.',
      'Yuborishni tasdiqlang',
    );
    if (!confirmed) {
      return;
    }

    const sent =
      value.mode === 'custom'
        ? await this.store.sendCustom(custom)
        : await this.store.sendTemplated(templated);

    if (sent) {
      this.form.controls.title.reset('');
      this.form.controls.body.reset('');
    }
  }
}
