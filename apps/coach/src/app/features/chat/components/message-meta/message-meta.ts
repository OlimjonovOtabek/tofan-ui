import { Component, input } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';

@Component({
  selector: 'coach-message-meta',
  imports: [Icon],
  template: `
    {{ time() }}
    @if (mine()) {
      <span class="ticks"
        ><coach-icon name="check" />
        @if (read()) {
          <coach-icon name="check" class="second" />
        }
      </span>
    }
  `,
  styleUrl: './message-meta.css',
  host: { class: 't-base6', '[class.is-overlay]': 'overlay()' },
})
export class MessageMeta {
  readonly time = input.required<string>();
  readonly mine = input(false);
  readonly read = input(false);
  readonly overlay = input(false);
}
