import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { Attachment, formatDuration, waveformBars } from '../../models/chat-attachment';

const SPEEDS = [1, 1.5, 2] as const;
const DEFAULT_SPEED = SPEEDS[0];
const PERCENT = 100;
const SEEK_STEP = 1;
const MIN_BAR_PERCENT = 10;

@Component({
  selector: 'coach-voice-message',
  imports: [Icon, TranslatePipe],
  templateUrl: './voice-message.html',
  styleUrl: './voice-message.css',
  host: { '[class.is-mine]': 'mine()' },
})
export class VoiceMessage {
  private readonly playback = inject(ChatPlaybackStore);
  private readonly audio = viewChild.required<ElementRef<HTMLAudioElement>>('audio');

  readonly attachment = input.required<Attachment>();
  readonly mine = input(false);

  readonly failed = output<void>();

  protected readonly playing = signal(false);
  protected readonly position = signal(0);
  protected readonly speed = signal<(typeof SPEEDS)[number]>(DEFAULT_SPEED);
  protected readonly seekMax = PERCENT;
  protected readonly seekStep = SEEK_STEP;

  protected readonly duration = computed(() => this.attachment().durationSeconds ?? 0);
  protected readonly progress = computed(() =>
    this.duration() === 0 ? 0 : Math.min(1, this.position() / this.duration()),
  );
  protected readonly seekValue = computed(() => Math.round(this.progress() * PERCENT));
  protected readonly showsSpeed = computed(() => this.playing() || this.speed() !== DEFAULT_SPEED);
  protected readonly speedLabel = computed(() => `${this.speed()}×`);
  protected readonly bars = computed(() => {
    const played = this.progress() * PERCENT;
    return waveformBars(this.attachment().waveform).map((value, index, all) => ({
      index,
      height: Math.max(MIN_BAR_PERCENT, value),
      played: ((index + 1) / all.length) * PERCENT <= played,
    }));
  });
  protected readonly clock = computed(() =>
    this.playing() || this.position() > 0
      ? `${formatDuration(this.position())} / ${formatDuration(this.duration())}`
      : formatDuration(this.duration()),
  );

  constructor() {
    effect(() => {
      if (this.playback.active() !== this.attachment().fileId && this.playing()) {
        this.audio().nativeElement.pause();
      }
    });
  }

  protected toggle(): void {
    const element = this.audio().nativeElement;
    if (!element.paused) {
      element.pause();
      return;
    }
    this.playback.claim(this.attachment().fileId);
    element.playbackRate = this.speed();
    element.play().catch(() => this.playing.set(false));
  }

  protected nextSpeed(): void {
    const next = SPEEDS[(SPEEDS.indexOf(this.speed()) + 1) % SPEEDS.length];
    this.speed.set(next);
    this.audio().nativeElement.playbackRate = next;
  }

  protected seek(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const seconds = (Number(event.target.value) / PERCENT) * this.duration();
      this.audio().nativeElement.currentTime = seconds;
      this.position.set(seconds);
    }
  }

  protected timeChanged(): void {
    this.position.set(this.audio().nativeElement.currentTime);
  }

  protected started(): void {
    this.playing.set(true);
  }

  protected stopped(): void {
    this.playing.set(false);
    this.playback.release(this.attachment().fileId);
  }

  protected ended(): void {
    this.stopped();
    this.position.set(0);
  }
}
