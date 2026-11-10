import {
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatDuration } from '../../models/chat-attachment';
import { RecordingState, remainingShare } from '../../models/recording';

const MILLISECONDS_PER_SECOND = 1000;
const CIRCLE_SIZE = 260;
const RING_WIDTH = 5;
const RING_CENTER = CIRCLE_SIZE / 2;
const RING_RADIUS = RING_CENTER - RING_WIDTH / 2 - 1;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'coach-video-note-recorder',
  imports: [Icon, TranslatePipe],
  templateUrl: './video-note-recorder.html',
  styleUrl: './video-note-recorder.css',
})
export class VideoNoteRecorder {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly preview = viewChild.required<ElementRef<HTMLVideoElement>>('preview');

  readonly state = input.required<RecordingState>();
  readonly stream = input<MediaStream | null>(null);
  readonly maxMs = input.required<number>();

  readonly cancelled = output<void>();
  readonly sent = output<void>();

  protected readonly ring = {
    viewBox: `0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`,
    center: RING_CENTER,
    radius: RING_RADIUS,
    length: RING_LENGTH,
  };
  protected readonly ringOffset = computed(
    () => RING_LENGTH * remainingShare(this.state().elapsedMs, this.maxMs()),
  );
  protected readonly clock = computed(
    () =>
      `${formatDuration(this.state().elapsedMs / MILLISECONDS_PER_SECOND)} / ${formatDuration(this.maxMs() / MILLISECONDS_PER_SECOND)}`,
  );

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      dialog.showModal();
      dialog.focus();
    });
    afterRenderEffect(() => {
      this.preview().nativeElement.srcObject = this.stream();
    });
  }

  protected escaped(event: Event): void {
    event.preventDefault();
    this.cancelled.emit();
  }
}
