import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationTemplate } from '../../models/notification-template';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
  TrainerStyle,
} from '../../models/notification-attributes';
import { NotificationTemplateDraft } from '../../models/notification-template-draft';
import { NOTIFICATION_TYPE_OPTIONS, TRAINER_STYLE_OPTIONS } from '../../models/notification-labels';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import {
  LocalizedTextField,
  createLocalizedTextGroup,
} from '@shared/components/localized-text-field/localized-text-field';
import { Select } from '@openng/optimus-ui/select';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';

@Component({
  selector: 'app-notification-template-form-dialog',
  imports: [
    ReactiveFormsModule,
    FormDialog,
    LocalizedTextField,
    Select,
    ToggleSwitch,
    TranslatePipe,
  ],
  templateUrl: './notification-template-form-dialog.html',
})
export class NotificationTemplateFormDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly template = input<NotificationTemplate | null>(null);
  readonly saving = input(false);

  readonly save = output<NotificationTemplateDraft>();

  protected readonly typeOptions = computed(() =>
    this.translator.options(NOTIFICATION_TYPE_OPTIONS),
  );
  protected readonly styleOptions = computed(() => this.translator.options(TRAINER_STYLE_OPTIONS));
  protected readonly titleMaxLength = NOTIFICATION_TITLE_MAX_LENGTH;
  protected readonly bodyMaxLength = NOTIFICATION_BODY_MAX_LENGTH;

  protected readonly titles = createLocalizedTextGroup(
    this.formBuilder,
    {},
    { maxLength: NOTIFICATION_TITLE_MAX_LENGTH },
  );
  protected readonly bodies = createLocalizedTextGroup(
    this.formBuilder,
    {},
    { maxLength: NOTIFICATION_BODY_MAX_LENGTH },
  );
  protected readonly form = this.formBuilder.group({
    type: this.formBuilder.control<NotificationType>('workoutReminder', Validators.required),
    trainerStyle: this.formBuilder.control<TrainerStyle>('professional', Validators.required),
    titles: this.titles,
    bodies: this.bodies,
    isActive: this.formBuilder.control(true),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.reset(this.template()));
      }
    });
  }

  protected title(): TranslationKey {
    return this.template() === null
      ? 'notifications.form.addTitle'
      : 'notifications.form.editTitle';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      type: value.type,
      trainerStyle: value.trainerStyle,
      title: value.titles.name,
      titleUz: value.titles.nameUz,
      titleRu: value.titles.nameRu,
      body: value.bodies.name,
      bodyUz: value.bodies.nameUz,
      bodyRu: value.bodies.nameRu,
      isActive: value.isActive,
    });
  }

  private reset(template: NotificationTemplate | null): void {
    this.form.reset({
      type: template?.type ?? 'workoutReminder',
      trainerStyle: template?.trainerStyle ?? 'professional',
      titles: {
        name: template?.titles.en ?? '',
        nameUz: template?.titles.uz ?? '',
        nameRu: template?.titles.ru ?? '',
      },
      bodies: {
        name: template?.bodies.en ?? '',
        nameUz: template?.bodies.uz ?? '',
        nameRu: template?.bodies.ru ?? '',
      },
      isActive: template?.isActive ?? true,
    });
  }
}
