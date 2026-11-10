import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Attachment, albumRows, imageAspect } from '../../models/chat-attachment';

@Component({
  selector: 'coach-image-album',
  imports: [TranslatePipe],
  templateUrl: './image-album.html',
  styleUrl: './image-album.css',
  host: { '[class.is-single]': 'single()' },
})
export class ImageAlbum {
  readonly attachments = input.required<readonly Attachment[]>();

  readonly opened = output<number>();
  readonly failed = output<void>();

  protected readonly single = computed(() => this.attachments().length === 1);
  protected readonly aspect = computed(() => {
    const first = this.attachments()[0];
    return first === undefined ? 1 : imageAspect(first);
  });
  protected readonly rows = computed(() =>
    albumRows(this.attachments()).map((tiles) => ({
      key: tiles[0]?.attachment.fileId ?? '',
      tiles,
    })),
  );
}
