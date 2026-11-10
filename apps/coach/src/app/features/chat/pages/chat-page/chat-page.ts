import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { IconName } from '@coach/core/ui/icon/icon-name';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ChatListStore } from '../../chat-list.store';
import { CHAT_FILTERS, ChatFilter, Conversation, chatInitials } from '../../models/chat';
import { MessageKind } from '../../models/chat-attachment';
import { ACTIVITY_LABELS, chatTime, previewText } from '../../models/chat-text';

const FILTER_LABELS = {
  all: 'coachApp.chat.filterAll',
  unread: 'coachApp.chat.filterUnread',
  read: 'coachApp.chat.filterRead',
} as const;

const KIND_ICONS: Readonly<Record<MessageKind, IconName | null>> = {
  text: null,
  image: 'image',
  file: 'paperclip',
  voice: 'mic',
  videoNote: 'video-note',
};

@Component({
  selector: 'coach-chat-page',
  imports: [TranslatePipe, MessagePipe, Avatar, EmptyState, Icon, Shimmer, TextField],
  providers: [ChatListStore],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
})
export class ChatPage {
  protected readonly store = inject(ChatListStore);
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  protected readonly filters = CHAT_FILTERS.map((value) => ({
    value,
    label: FILTER_LABELS[value],
  }));
  protected readonly rows = computed(() => {
    const now = this.store.now();
    const activities = this.store.activities();
    const t = this.translator.translate.bind(this.translator);
    return this.store.visible().map((conversation) => {
      const activity = activities.get(conversation.id) ?? null;
      return {
        conversation,
        initials: chatInitials(conversation.name),
        name: conversation.name || t('coachApp.common.unknown'),
        live: activity !== null,
        icon: activity === null ? this.iconOf(conversation) : null,
        preview: activity === null ? this.previewOf(conversation) : t(ACTIVITY_LABELS[activity]),
        time:
          conversation.lastMessageOn === null
            ? null
            : chatTime(conversation.lastMessageOn, now, this.locale(), t),
      };
    });
  });

  constructor() {
    void this.store.load();
  }

  protected select(filter: ChatFilter): void {
    this.store.filter.set(filter);
  }

  private previewOf(conversation: Conversation): string {
    const t = this.translator.translate.bind(this.translator);
    const text = previewText(conversation.lastMessageKind, conversation.lastMessageText, t);
    const mine =
      conversation.lastMessageSenderId !== null &&
      conversation.lastMessageSenderId !== conversation.otherUserId;
    return mine ? t('coachApp.chat.youPrefix', { text }) : text;
  }

  private iconOf(conversation: Conversation): IconName | null {
    return conversation.lastMessageKind === null ? null : KIND_ICONS[conversation.lastMessageKind];
  }

  protected open(conversation: Conversation): void {
    void this.router.navigate(['/chat/c', conversation.id]);
  }
}
