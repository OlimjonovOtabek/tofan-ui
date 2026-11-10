import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Icon } from '@coach/core/ui/icon/icon';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { formatFileSize } from '@shared/utils/file-size';
import { acceptAttribute, maxUploadSize } from '@shared/utils/file-upload-rules';
import { ChatComposerStore, PickKind } from '../../chat-composer.store';
import { MESSAGE_MAX_LENGTH } from '../../models/chat';
import { MAX_ATTACHMENTS } from '../../models/chat-attachment';
import { OUTGOING_CATEGORIES } from '../../models/chat-outbox';
import { VIDEO_NOTE_SECONDS } from '../../models/video-note-capture';
import { ComposerTray } from '../composer-tray/composer-tray';
import { VideoNoteRecorder } from '../video-note-recorder/video-note-recorder';
import { VoiceRecordingBar } from '../voice-recording-bar/voice-recording-bar';

const IMAGE_TYPE_PREFIX = 'image/';

@Component({
  selector: 'coach-chat-composer',
  imports: [Icon, TranslatePipe, ComposerTray, VideoNoteRecorder, VoiceRecordingBar],
  templateUrl: './chat-composer.html',
  styleUrl: './chat-composer.css',
  host: { '(document:pointerdown)': 'pointedOutside($event)' },
})
export class ChatComposer {
  protected readonly store = inject(ChatComposerStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly imageInput = viewChild.required<ElementRef<HTMLInputElement>>('imageInput');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly menuOpen = signal(false);
  protected readonly maxLength = MESSAGE_MAX_LENGTH;
  protected readonly imageAccept = acceptAttribute(OUTGOING_CATEGORIES.image);
  protected readonly fileAccept = acceptAttribute(OUTGOING_CATEGORIES.file);
  protected readonly imageLimit = { max: MAX_ATTACHMENTS };
  protected readonly videoNoteLimit = { seconds: VIDEO_NOTE_SECONDS };
  protected readonly fileLimit = { size: formatFileSize(maxUploadSize(OUTGOING_CATEGORIES.file)) };

  protected attach(): void {
    const kind = this.store.pickedKind();
    if (kind !== null) {
      this.browse(kind);
      return;
    }
    this.menuOpen.update((open) => !open);
  }

  protected browse(kind: PickKind): void {
    this.menuOpen.set(false);
    (kind === 'image' ? this.imageInput() : this.fileInput()).nativeElement.click();
  }

  protected recordVideoNote(): void {
    this.menuOpen.set(false);
    void this.store.startVideoNote();
  }

  protected chosen(kind: PickKind, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    this.store.pick(kind, Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  protected pasted(event: ClipboardEvent): void {
    const images = Array.from(event.clipboardData?.files ?? []).filter((file) =>
      file.type.startsWith(IMAGE_TYPE_PREFIX),
    );
    if (images.length > 0) {
      event.preventDefault();
      this.store.pick('image', images);
    }
  }

  protected typed(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.store.setDraft(event.target.value);
    }
  }

  protected enter(event: Event): void {
    if (event instanceof KeyboardEvent && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void this.store.send();
    }
  }

  protected pointedOutside(event: PointerEvent): void {
    const inside = event.target instanceof Node && this.host.nativeElement.contains(event.target);
    if (this.menuOpen() && !inside) {
      this.menuOpen.set(false);
    }
  }
}
