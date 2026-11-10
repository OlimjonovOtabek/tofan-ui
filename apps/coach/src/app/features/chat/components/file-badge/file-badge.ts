import { Component, computed, input } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { fileBadge } from '../../models/chat-attachment';

@Component({
  selector: 'coach-file-badge',
  imports: [Icon],
  template: `
    @if (label()) {
      {{ label() }}
    } @else {
      <coach-icon name="file" />
    }
  `,
  host: { 'aria-hidden': 'true' },
})
export class FileBadge {
  readonly fileName = input.required<string>();

  protected readonly label = computed(() => fileBadge(this.fileName()));
}
