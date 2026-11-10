import { Component, computed, input, output } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatFileSize } from '@shared/utils/file-size';
import { formatDuration } from '../../models/chat-attachment';
import { FileBadge } from '../file-badge/file-badge';
import { PendingMessage } from '../../models/chat-outbox';

const DONE = 100;
const MAX_COLUMNS = 3;
const RING_RADIUS = 20;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'coach-pending-bubble',
  imports: [FileBadge, Icon, Spinner, TranslatePipe],
  templateUrl: './pending-bubble.html',
  styleUrl: './pending-bubble.css',
  host: { '[class.is-media]': "pending().kind === 'image'" },
})
export class PendingBubble {
  readonly pending = input.required<PendingMessage>();

  readonly retried = output<void>();
  readonly discarded = output<void>();

  protected readonly ringRadius = RING_RADIUS;
  protected readonly ringLength = RING_LENGTH;
  protected readonly columns = computed(() => Math.min(MAX_COLUMNS, this.pending().files.length));
  protected readonly failed = computed(() => this.pending().failure !== null);
  protected readonly processing = computed(() => this.pending().progress >= DONE);
  protected readonly ringOffset = computed(
    () => RING_LENGTH * (1 - Math.min(DONE, this.pending().progress) / DONE),
  );
  protected readonly files = computed(() =>
    this.pending().files.map((picked) => ({
      id: picked.id,
      previewUrl: picked.previewUrl,
      name: picked.file.name,
      size: formatFileSize(picked.file.size),
    })),
  );
  protected readonly duration = computed(() => formatDuration(this.pending().durationSeconds ?? 0));
}
