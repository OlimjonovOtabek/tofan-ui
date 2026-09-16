import { Component, effect, inject, input, model, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
  TrainerStyle,
} from '@domain/notifications/notification-attributes';
import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import {
  NOTIFICATION_TYPE_OPTIONS,
  TRAINER_STYLE_OPTIONS,
} from '@presentation/notifications/notification-labels';
import { FormDialog } from '@presentation/shared/components/form-dialog/form-dialog';
import {
  LocalizedTextField,
  createLocalizedTextGroup,
} from '@presentation/shared/components/localized-text-field/localized-text-field';
import { Select } from '@openng/optimus-ui/select';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';

/** Create and edit form of a template: one type and style, the text in three languages. */
@Component({
  selector: 'app-notification-template-form-dialog',
  imports: [ReactiveFormsModule, FormDialog, LocalizedTextField, Select, ToggleSwitch],
  templateUrl: './notification-template-form-dialog.html',
})
export class NotificationTemplateFormDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly visible = model.required<boolean>();
  /** The template being edited, or `null` while a new one is created. */
  readonly template = input<NotificationTemplate | null>(null);
  readonly saving = input(false);

  readonly save = output<NotificationTemplateDraft>();

  protected readonly typeOptions = NOTIFICATION_TYPE_OPTIONS;
  protected readonly styleOptions = TRAINER_STYLE_OPTIONS;
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
    // Reload the form whenever the dialog opens, so an edit never shows the previous template.
    effect(() => {
      if (this.visible()) {
        untracked(() => this.reset(this.template()));
      }
    });
  }

  protected title(): string {
    return this.template() === null ? "Shablon qo'shish" : 'Shablonni tahrirlash';
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
        name: template?.title ?? '',
        nameUz: template?.titleUz ?? '',
        nameRu: template?.titleRu ?? '',
      },
      bodies: {
        name: template?.body ?? '',
        nameUz: template?.bodyUz ?? '',
        nameRu: template?.bodyRu ?? '',
      },
      isActive: template?.isActive ?? true,
    });
  }
}
