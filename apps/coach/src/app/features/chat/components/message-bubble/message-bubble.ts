import { Component, computed, input, output } from '@angular/core';
import { Attachment } from '../../models/chat-attachment';
import { Message } from '../../models/chat';
import { FileAttachment } from '../file-attachment/file-attachment';
import { ImageAlbum } from '../image-album/image-album';
import { MessageMeta } from '../message-meta/message-meta';
import { VideoNote } from '../video-note/video-note';
import { VoiceMessage } from '../voice-message/voice-message';

@Component({
  selector: 'coach-message-bubble',
  imports: [FileAttachment, ImageAlbum, MessageMeta, VideoNote, VoiceMessage],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.css',
  host: {
    '[class.is-mine]': 'mine()',
    '[class.is-media]': "message().kind === 'image'",
    '[class.is-photo-only]': "message().kind === 'image' && !hasText()",
    '[class.is-bare]': "message().kind === 'videoNote'",
  },
})
export class MessageBubble {
  readonly message = input.required<Message>();
  readonly mine = input(false);
  readonly read = input(false);
  readonly time = input.required<string>();

  readonly imageOpened = output<number>();
  readonly fileOpened = output<Attachment>();
  readonly mediaFailed = output<void>();

  protected readonly first = computed(() => this.message().attachments[0] ?? null);
  protected readonly hasText = computed(() => this.message().text !== '');
}
