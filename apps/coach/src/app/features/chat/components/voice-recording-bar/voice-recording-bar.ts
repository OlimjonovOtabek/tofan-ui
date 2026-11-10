import { Component, computed, input, output } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatDuration } from '../../models/chat-attachment';
import { LIVE_LEVEL_BARS } from '../../models/voice-note';
import { RecordingState } from '../../voice-recording.store';

const MILLISECONDS_PER_SECOND = 1000;
const MIN_LEVEL_PERCENT = 12;

@Component({
  selector: 'coach-voice-recording-bar',
  imports: [Icon, TranslatePipe],
  templateUrl: './voice-recording-bar.html',
  styleUrl: './voice-recording-bar.css',
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
})
export class VoiceRecordingBar {
  readonly state = input.required<RecordingState>();

  readonly cancelled = output<void>();
  readonly sent = output<void>();

  protected readonly clock = computed(() =>
    formatDuration(this.state().elapsedMs / MILLISECONDS_PER_SECOND),
  );
  protected readonly levels = computed(() => {
    const levels = this.state().levels;
    const padding = Array.from({ length: LIVE_LEVEL_BARS - levels.length }, () => 0);
    return [...padding, ...levels].map((level, index) => ({
      index,
      height: Math.max(MIN_LEVEL_PERCENT, level),
    }));
  });
}
