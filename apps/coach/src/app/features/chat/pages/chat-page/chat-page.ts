import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ChatListStore } from '../../chat-list.store';
import { CHAT_FILTERS, ChatFilter, Conversation, chatInitials } from '../../models/chat';
import { chatTime } from '../../models/chat-text';

const FILTER_LABELS = {
  all: 'coachApp.chat.filterAll',
  unread: 'coachApp.chat.filterUnread',
  read: 'coachApp.chat.filterRead',
} as const;

@Component({
  selector: 'coach-chat-page',
  imports: [TranslatePipe, MessagePipe, Avatar, EmptyState, Shimmer, TextField],
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
    const t = this.translator.translate.bind(this.translator);
    return this.store.visible().map((conversation) => {
      const mine =
        conversation.lastMessageSenderId !== null &&
        conversation.lastMessageSenderId !== conversation.otherUserId;
      return {
        conversation,
        initials: chatInitials(conversation.name),
        name: conversation.name || t('coachApp.common.unknown'),
        preview: mine
          ? t('coachApp.chat.youPrefix', { text: conversation.lastMessageText })
          : conversation.lastMessageText,
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

  protected open(conversation: Conversation): void {
    void this.router.navigate(['/chat/c', conversation.id]);
  }
}
