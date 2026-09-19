import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
} from '../../models/notification-attributes';
import {
  CustomNotificationInput,
  NotificationDataEntry,
  TemplatedNotificationInput,
  createCustomNotification,
  createTemplatedNotification,
} from '../../models/outgoing-notification';
import { isUuid } from '@shared/utils/identifiers';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_OPTIONS,
} from '../../models/notification-labels';
import {
  DataEntryControls,
  NotificationDataEntries,
} from '../../components/notification-data-entries/notification-data-entries';
import { TemplateCoverageHint } from '../../components/template-coverage-hint/template-coverage-hint';
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
import { TranslationKey } from '@core/i18n/dictionary';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectOption } from '@shared/models/select-option';

type SendMode = 'templated' | 'custom';

interface OutgoingDraft {
  readonly mode: SendMode;
  readonly custom: CustomNotificationInput;
  readonly templated: TemplatedNotificationInput;
}

const MODE_OPTIONS: SelectOption<SendMode, TranslationKey>[] = [
  { value: 'templated', label: 'notifications.send.templated' },
  { value: 'custom', label: 'notifications.send.custom' },
];

function uuidValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();
  return value.length === 0 || isUuid(value) ? null : { uuid: true };
}

@Component({
  selector: 'app-send-notification-page',
  imports: [
    ReactiveFormsModule,
    NotificationDataEntries,
    TemplateCoverageHint,
    Button,
    InputText,
    Message,
    Select,
    SelectButton,
    Textarea,
    TranslatePipe,
    MessagePipe,
  ],
  providers: [NotificationSendStore],
  templateUrl: './send-notification-page.html',
})
export class SendNotificationPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly translator = inject(Translator);

  protected readonly store = inject(NotificationSendStore);

  protected readonly modeOptions = computed(() => this.translator.options(MODE_OPTIONS));
  protected readonly typeOptions = computed(() =>
    this.translator.options(NOTIFICATION_TYPE_OPTIONS),
  );
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

  protected isInvalid(control: 'userId' | 'title' | 'body'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  protected isMissing(control: 'title' | 'body'): boolean {
    const field = this.form.controls[control];
    return this.mode() === 'custom' && field.touched && field.value.trim().length === 0;
  }

  protected async send(): Promise<void> {
    const outgoing = this.readOutgoing();
    if (outgoing === null || !(await this.confirmSending(outgoing.templated))) {
      return;
    }

    const sent =
      outgoing.mode === 'custom'
        ? await this.store.sendCustom(outgoing.custom)
        : await this.store.sendTemplated(outgoing.templated);

    if (sent) {
      this.form.controls.title.reset('');
      this.form.controls.body.reset('');
    }
  }

  private readOutgoing(): OutgoingDraft | null {
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const customTextMissing =
      value.mode === 'custom' && (value.title.trim() === '' || value.body.trim() === '');
    if (this.form.invalid || customTextMissing) {
      return null;
    }

    const data: NotificationDataEntry[] = value.data;
    const templated = { userId: value.userId, type: value.type, data };
    const custom = { ...templated, title: value.title, body: value.body };
    try {
      if (value.mode === 'custom') {
        createCustomNotification(custom);
      } else {
        createTemplatedNotification(templated);
      }
    } catch (error) {
      this.notifications.error(error);
      return null;
    }
    return { mode: value.mode, custom, templated };
  }

  private confirmSending({ userId, type }: TemplatedNotificationInput): Promise<boolean> {
    return this.confirmations.confirm(
      {
        key: 'notifications.send.confirm',
        params: { type: this.translator.translate(NOTIFICATION_TYPE_LABELS[type]), userId },
      },
      'notifications.send.confirmHeader',
    );
  }
}
