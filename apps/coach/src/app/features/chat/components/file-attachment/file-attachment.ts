import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatFileSize } from '@shared/utils/file-size';
import { Attachment } from '../../models/chat-attachment';
import { FileBadge } from '../file-badge/file-badge';

@Component({
  selector: 'coach-file-attachment',
  imports: [FileBadge, TranslatePipe],
  template: `
    <button
      type="button"
      class="file"
      [attr.aria-label]="'coachApp.conversation.openFile' | t: { name: attachment().fileName }"
      (click)="opened.emit()"
    >
      <coach-file-badge class="badge t-base7 font-bold" [fileName]="attachment().fileName" />
      <span class="text">
        <span class="name t-base3 font-semibold">{{ attachment().fileName }}</span>
        <span class="size t-base5">{{ size() }}</span>
      </span>
    </button>
  `,
  styleUrl: './file-attachment.css',
  host: { '[class.is-mine]': 'mine()' },
})
export class FileAttachment {
  readonly attachment = input.required<Attachment>();
  readonly mine = input(false);

  readonly opened = output<void>();

  protected readonly size = computed(() => formatFileSize(this.attachment().sizeBytes));
}
