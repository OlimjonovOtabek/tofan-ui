import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { Attachment, formatDuration } from '../../models/chat-attachment';

const NOTE_SIZE = 208;
const RING_WIDTH = 4;
const RING_CENTER = NOTE_SIZE / 2;
const RING_RADIUS = RING_CENTER - RING_WIDTH / 2 - 1;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'coach-video-note',
  imports: [Icon, TranslatePipe],
  templateUrl: './video-note.html',
  styleUrl: './video-note.css',
})
export class VideoNote {
  private readonly playback = inject(ChatPlaybackStore);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  readonly attachment = input.required<Attachment>();

  readonly failed = output<void>();

  protected readonly position = signal(0);
  protected readonly ring = {
    viewBox: `0 0 ${NOTE_SIZE} ${NOTE_SIZE}`,
    center: RING_CENTER,
    radius: RING_RADIUS,
    length: RING_LENGTH,
  };

  protected readonly withSound = computed(
    () => this.playback.active() === this.attachment().fileId,
  );
  protected readonly duration = computed(() => this.attachment().durationSeconds ?? 0);
  protected readonly ringOffset = computed(() => {
    const total = this.duration();
    const done = this.withSound() && total > 0 ? Math.min(1, this.position() / total) : 0;
    return RING_LENGTH * (1 - done);
  });
  protected readonly clock = computed(() =>
    this.withSound()
      ? `${formatDuration(this.position())} / ${formatDuration(this.duration())}`
      : formatDuration(this.duration()),
  );

  constructor() {
    afterRenderEffect(() => {
      if (!this.withSound()) {
        this.preview();
      }
    });
  }

  protected toggle(): void {
    if (this.withSound()) {
      this.playback.release(this.attachment().fileId);
      return;
    }
    this.playback.claim(this.attachment().fileId);
    const element = this.video().nativeElement;
    element.muted = false;
    element.loop = false;
    element.currentTime = 0;
    element.play().catch(() => this.playback.release(this.attachment().fileId));
  }

  protected timeChanged(): void {
    this.position.set(this.video().nativeElement.currentTime);
  }

  protected ended(): void {
    this.playback.release(this.attachment().fileId);
  }

  private preview(): void {
    const element = this.video().nativeElement;
    element.muted = true;
    element.loop = true;
    element.play().catch(keepTheStillFrameWhenAutoplayIsBlocked);
  }
}

function keepTheStillFrameWhenAutoplayIsBlocked(): void {
  return;
}
