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
import { Select } from '@openng/optimus-ui/select';
import { Textarea } from '@openng/optimus-ui/textarea';
import { FILE_CATEGORY_OPTIONS } from '../../models/file-labels';
import { CAPTION_MAX_LENGTH, MediaUploadDraft } from '../../models/media-upload';

@Component({
  selector: 'app-media-upload-dialog',
  imports: [ReactiveFormsModule, FormDialog, ProgressBar, Select, Textarea],
  templateUrl: './media-upload-dialog.html',
})
export class MediaUploadDialog {
  readonly visible = model.required<boolean>();
  readonly uploading = input(false);
  readonly progress = input(0);

  readonly upload = output<MediaUploadDraft>();

  protected readonly categoryOptions = FILE_CATEGORY_OPTIONS;
  protected readonly captionMaxLength = CAPTION_MAX_LENGTH;

  protected readonly form = inject(NonNullableFormBuilder).group({
    category: [null as FileCategory | null, Validators.required],
    caption: ['', Validators.maxLength(CAPTION_MAX_LENGTH)],
  });
  protected readonly file = signal<File | null>(null);

  protected readonly category = toSignal(this.form.controls.category.valueChanges, {
    initialValue: null,
  });
  private readonly captionLength = toSignal(this.form.controls.caption.valueChanges, {
    initialValue: '',
  });

  protected readonly accept = computed(() => {
    const category = this.category();
    return category === null ? '' : allowedExtensions(category).join(',');
  });
  protected readonly limitHint = computed(() => {
    const category = this.category();
    return category === null
      ? 'Avval fayl turini tanlang.'
      : `${this.accept()} · ${formatFileSize(maxUploadSize(category))} gacha`;
  });
  protected readonly fileLabel = computed(() => {
    const file = this.file();
    return file === null ? null : `${file.name} · ${formatFileSize(file.size)}`;
  });
  protected readonly captionCount = computed(() => this.captionLength().length);
  protected readonly cannotUpload = computed(
    () =>
      this.file() === null || this.category() === null || this.captionCount() > CAPTION_MAX_LENGTH,
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
    const { category, caption } = this.form.getRawValue();
    this.upload.emit({ file: this.file(), category, caption });
  }

  private clear(): void {
    this.form.reset();
    this.file.set(null);
  }
}
