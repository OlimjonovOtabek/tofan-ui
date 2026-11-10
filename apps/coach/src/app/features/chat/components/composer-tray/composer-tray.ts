import { Component, computed, input, output } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatFileSize } from '@shared/utils/file-size';
import { PickedFile } from '../../models/chat-outbox';
import { FileBadge } from '../file-badge/file-badge';

@Component({
  selector: 'coach-composer-tray',
  imports: [FileBadge, Icon, TranslatePipe],
  templateUrl: './composer-tray.html',
  styleUrl: './composer-tray.css',
})
export class ComposerTray {
  readonly picked = input.required<readonly PickedFile[]>();
  readonly images = input(false);
  readonly max = input.required<number>();

  readonly removed = output<string>();
  readonly added = output<void>();

  protected readonly canAdd = computed(() => this.picked().length < this.max());
  protected readonly items = computed(() =>
    this.picked().map((picked) => ({
      id: picked.id,
      previewUrl: picked.previewUrl,
      name: picked.file.name,
      size: formatFileSize(picked.file.size),
    })),
  );
}
