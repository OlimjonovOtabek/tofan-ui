import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { FileCategory } from '@shared/models/file-category';
import { formatFileSize } from '@shared/utils/file-size';
import { allowedExtensions, maxUploadSize } from '@shared/utils/file-upload-rules';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { Message } from '@openng/optimus-ui/message';
import { Select } from '@openng/optimus-ui/select';
import { Textarea } from '@openng/optimus-ui/textarea';
import { ErrorMessage } from '@core/feedback/error-message';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { pickLocalized } from '@shared/models/localized-text';
import { FILE_CATEGORY_OPTIONS } from '../../models/file-labels';
import { ExerciseChoice, sortByName } from '../../models/exercise-choice';
import { CAPTION_MAX_LENGTH, MediaUploadDraft, needsExercise } from '../../models/media-upload';

@Component({
  selector: 'app-media-upload-dialog',
  imports: [
    ReactiveFormsModule,
    FormDialog,
    Message,
    ProgressBar,
    Select,
    Textarea,
    TranslatePipe,
    MessagePipe,
  ],
  templateUrl: './media-upload-dialog.html',
})
export class MediaUploadDialog {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly visible = model.required<boolean>();
  readonly uploading = input(false);
  readonly progress = input(0);
  readonly exerciseChoices = input<readonly ExerciseChoice[]>([]);
  readonly exercisesLoading = input(false);
  readonly exercisesError = input<ErrorMessage | null>(null);

  readonly upload = output<MediaUploadDraft>();
  readonly retryExercises = output();

  protected readonly categoryOptions = computed(() =>
    this.translator.options(FILE_CATEGORY_OPTIONS),
  );
  protected readonly captionMaxLength = CAPTION_MAX_LENGTH;

  protected readonly form = inject(NonNullableFormBuilder).group({
    category: [null as FileCategory | null, Validators.required],
    exerciseId: [null as string | null],
    caption: ['', Validators.maxLength(CAPTION_MAX_LENGTH)],
  });
  protected readonly file = signal<File | null>(null);

  protected readonly category = toSignal(this.form.controls.category.valueChanges, {
    initialValue: null,
  });
  private readonly exerciseId = toSignal(this.form.controls.exerciseId.valueChanges, {
    initialValue: null,
  });
  private readonly captionLength = toSignal(this.form.controls.caption.valueChanges, {
    initialValue: '',
  });

  protected readonly accept = computed(() => {
    const category = this.category();
    return category === null ? '' : allowedExtensions(category).join(',');
  });
  protected readonly maxSize = computed(() => {
    const category = this.category();
    return category === null ? null : formatFileSize(maxUploadSize(category));
  });
  protected readonly fileLabel = computed(() => {
    const file = this.file();
    return file === null ? null : `${file.name} · ${formatFileSize(file.size)}`;
  });
  protected readonly captionCount = computed(() => this.captionLength().length);
  protected readonly asksForExercise = computed(() => needsExercise(this.category()));
  protected readonly exerciseOptions = computed(() => {
    const locale = this.localeStore.locale();
    return sortByName(this.exerciseChoices(), locale).map((choice) => ({
      value: choice.id,
      label: this.choiceLabel(choice),
    }));
  });
  protected readonly cannotUpload = computed(
    () =>
      this.file() === null ||
      this.category() === null ||
      (this.asksForExercise() && this.exerciseId() === null) ||
      this.captionCount() > CAPTION_MAX_LENGTH,
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.clear());
      }
    });
  }

  protected choose(event: Event): void {
    const picker = event.target as HTMLInputElement;
    this.file.set(picker.files?.[0] ?? null);
    picker.value = '';
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    const { category, exerciseId, caption } = this.form.getRawValue();
    this.upload.emit({ file: this.file(), category, exerciseId, caption });
  }

  private clear(): void {
    this.form.reset();
    this.file.set(null);
  }

  private choiceLabel(choice: ExerciseChoice): string {
    const name = pickLocalized(choice.names, this.localeStore.locale());
    return choice.isActive
      ? name
      : `${name} (${this.translator.translate('media.upload.inactive')})`;
  }
}
