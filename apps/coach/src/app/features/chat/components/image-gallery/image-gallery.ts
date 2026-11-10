import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Attachment } from '../../models/chat-attachment';

@Component({
  selector: 'coach-image-gallery',
  imports: [Icon, TranslatePipe],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
})
export class ImageGallery {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly attachments = input.required<readonly Attachment[]>();
  readonly startIndex = input(0);
  readonly title = input('');
  readonly subtitle = input('');
  readonly caption = input('');

  readonly closed = output<void>();
  readonly downloaded = output<Attachment>();
  readonly failed = output<void>();

  protected readonly index = linkedSignal(() => this.startIndex());
  protected readonly current = computed(() => this.attachments()[this.index()] ?? null);
  protected readonly many = computed(() => this.attachments().length > 1);
  protected readonly thumbs = computed(() =>
    this.attachments().map((attachment, index) => ({ attachment, index })),
  );

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      dialog.showModal();
      dialog.focus();
    });
  }

  protected show(index: number): void {
    const count = this.attachments().length;
    this.index.set((index + count) % count);
  }

  protected previous(): void {
    this.show(this.index() - 1);
  }

  protected next(): void {
    this.show(this.index() + 1);
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }
}
