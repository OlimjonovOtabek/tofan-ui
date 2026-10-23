import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Icon } from '@coach/core/ui/icon/icon';
import { Note } from '@coach/core/ui/note/note';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { formatTime } from '@coach/core/format/formats';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ConversationStore } from '../../conversation.store';
import { chatInitials, isMine, isRead, opensDay } from '../../models/chat';
import { dayLabel, presenceText } from '../../models/chat-text';

const OLDER_THRESHOLD_PX = 240;

@Component({
  selector: 'coach-conversation-page',
  imports: [TranslatePipe, MessagePipe, AppBar, Avatar, EmptyState, Icon, Note, Spinner],
  providers: [ConversationStore],
  templateUrl: './conversation-page.html',
  styleUrl: './conversation-page.css',
})
export class ConversationPage {
  protected readonly store = inject(ConversationStore);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly userId = input<string | undefined>(undefined);
  readonly conversationId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);

  protected readonly draft = signal('');
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly title = computed(() => this.store.name() || this.name() || '');
  protected readonly presence = computed(() =>
    presenceText(
      { typing: this.store.typing(), online: this.store.online(), lastSeen: this.store.lastSeen() },
      new Date(),
      this.locale(),
      this.translator.translate.bind(this.translator),
    ),
  );
  protected readonly live = computed(() => this.store.typing() || this.store.online());
  protected readonly initials = computed(() => chatInitials(this.title()));
  protected readonly rows = computed(() => {
    const messages = this.store.messages();
    const other = this.store.otherUserId();
    const now = new Date();
    const t = this.translator.translate.bind(this.translator);
    return messages.map((message, index) => ({
      message,
      mine: isMine(message, other),
      read: isMine(message, other) && isRead(message, this.store.otherReadUpTo()),
      time: formatTime(message.sentOn),
      day: opensDay(messages, index) ? dayLabel(message.sentOn, now, this.locale(), t) : null,
    }));
  });
  protected readonly canSend = computed(() => this.draft().trim() !== '' && !this.store.sending());

  constructor() {
    effect(() => {
      const target = {
        userId: this.userId(),
        conversationId: this.conversationId(),
        name: this.name(),
      };
      untracked(() => void this.store.open(target));
    });
  }

  protected scrolled(): void {
    const element = this.scroller()?.nativeElement;
    if (element === undefined) {
      return;
    }
    const remaining = element.scrollHeight + element.scrollTop - element.clientHeight;
    if (remaining < OLDER_THRESHOLD_PX) {
      void this.store.loadOlder();
    }
  }

  protected typed(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.draft.set(event.target.value);
      this.store.typed();
    }
  }

  protected enter(event: Event): void {
    if (event instanceof KeyboardEvent && !event.shiftKey) {
      event.preventDefault();
      void this.send();
    }
  }

  protected async send(): Promise<void> {
    const text = this.draft();
    if (!this.canSend()) {
      return;
    }
    this.draft.set('');
    if (!(await this.store.send(text)) && this.draft() === '') {
      this.draft.set(text);
    }
  }
}
