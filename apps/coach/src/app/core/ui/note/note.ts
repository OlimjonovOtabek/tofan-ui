import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-name';

@Component({
  selector: 'coach-note',
  imports: [Icon],
  template: `
    <div class="row">
      <coach-icon [name]="icon()" />
      <p class="t-base4">{{ text() }}</p>
    </div>
    <ng-content />
  `,
  styleUrl: './note.css',
  host: { '[class.is-plain]': 'plain()' },
})
export class Note {
  readonly icon = input<IconName>('info');
  readonly text = input.required<string>();
  readonly plain = input(false);
}
