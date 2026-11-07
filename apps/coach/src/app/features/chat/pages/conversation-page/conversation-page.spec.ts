import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ErrorMessage } from '@core/feedback/error-message';
import { LocaleStore } from '@core/i18n/locale.store';
import { ConversationStore } from '../../conversation.store';
import { Message } from '../../models/chat';
import { ConversationPage } from './conversation-page';

const VIP_ONLY = 'Chat is open only to athletes with an active VIP subscription.';
const NO_MESSAGES = 'No messages yet. Say hello!';
const UNSENT_LABEL = 'Unsent message';

function createFakeStore() {
  return {
    name: signal('Aziz'),
    photoUrl: signal<string | null>(null),
    messages: signal<readonly Message[]>([]),
    canWrite: signal(true),
    typing: signal(false),
    online: signal(false),
    lastSeen: signal<Date | null>(null),
    otherUserId: signal('them'),
    otherReadUpTo: signal<Date | null>(null),
    loading: signal(false),
    loadError: signal<ErrorMessage | null>(null),
    sending: signal(false),
    loadingOlder: signal(false),
    maxLength: 2000,
    open: vi.fn().mockResolvedValue(undefined),
    send: vi.fn(),
    typed: vi.fn(),
    loadOlder: vi.fn(),
  };
}

describe('ConversationPage', () => {
  let store: ReturnType<typeof createFakeStore>;
  let fixture: ComponentFixture<ConversationPage>;

  beforeEach(async () => {
    store = createFakeStore();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.overrideComponent(ConversationPage, {
      set: { providers: [{ provide: ConversationStore, useValue: store }] },
    });
    TestBed.inject(LocaleStore).setLocale('en');
    fixture = TestBed.createComponent(ConversationPage);
    fixture.componentRef.setInput('userId', 'them');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function composer(): HTMLTextAreaElement | null {
    return page().querySelector('textarea');
  }

  async function type(text: string): Promise<void> {
    const input = composer();
    if (input === null) {
      throw new Error('The composer is not shown.');
    }
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function unsentBlock(): HTMLElement | null {
    return page().querySelector<HTMLElement>('.unsent');
  }

  async function refuseSendOf(text: string): Promise<void> {
    store.send.mockImplementation(() => {
      store.canWrite.set(false);
      return Promise.resolve(false);
    });
    await type(text);
    await submit();
  }

  async function submit(): Promise<void> {
    page().querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should offer the composer and the invitation to write when the conversation is writable', () => {
    expect(composer()).not.toBeNull();
    expect(page().textContent).toContain(NO_MESSAGES);
    expect(page().querySelector('coach-note')).toBeNull();
  });

  it('should explain that chat is VIP only and hide the composer when the conversation is read-only', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()).toBeNull();
    expect(page().querySelector('coach-note')?.textContent).toContain(VIP_ONLY);
  });

  it('should not invite the coach to write when a read-only conversation has no history', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(page().textContent).not.toContain(NO_MESSAGES);
  });

  it('should restore the typed text when a send fails and the conversation stays writable', async () => {
    store.send.mockResolvedValue(false);
    await type('salom');

    await submit();

    expect(store.send).toHaveBeenCalledWith('salom');
    expect(composer()?.value).toBe('salom');
  });

  it('should keep the typed text when a refused send turns the conversation read-only', async () => {
    store.send.mockImplementation(() => {
      store.canWrite.set(false);
      return Promise.resolve(false);
    });
    await type('salom');

    await submit();
    expect(composer()).toBeNull();
    store.canWrite.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()?.value).toBe('salom');
  });

  it('should show the unsent text above the read-only note when a refused send turned the conversation read-only', async () => {
    await refuseSendOf('salom\nDo‘stim');

    const block = unsentBlock();
    const note = page().querySelector('coach-note');
    expect(block?.textContent).toContain(UNSENT_LABEL);
    expect(block?.querySelector('p')?.textContent).toBe('salom\nDo‘stim');
    expect(block?.compareDocumentPosition(note as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should not show an unsent block when the conversation is read-only and nothing was typed', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(unsentBlock()).toBeNull();
    expect(page().textContent).not.toContain(UNSENT_LABEL);
  });

  it('should not show an unsent block when the typed text is only spaces', async () => {
    await type('   ');
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()).toBeNull();
    expect(unsentBlock()).toBeNull();
  });

  it('should not show an unsent block when the conversation is writable', async () => {
    await type('salom');

    expect(unsentBlock()).toBeNull();
    expect(page().textContent).not.toContain(UNSENT_LABEL);
  });

  it('should hide the unsent block and give the draft back to the composer when the conversation is writable again', async () => {
    await refuseSendOf('salom');
    store.canWrite.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(unsentBlock()).toBeNull();
    expect(composer()?.value).toBe('salom');
  });
});
