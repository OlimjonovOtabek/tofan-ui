import { Routes } from '@angular/router';
import { PUSHED_ROUTE } from '@coach/core/layout/coach-navigation';
import { pageTitle } from '@core/i18n/page-title';
import { ChatPage } from './pages/chat-page/chat-page';
import { ConversationPage } from './pages/conversation-page/conversation-page';

export const CHAT_ROUTES: Routes = [
  { path: '', title: pageTitle('coachApp.chat.title'), component: ChatPage },
  {
    path: 'with/:userId',
    title: pageTitle('coachApp.chat.title'),
    data: { [PUSHED_ROUTE]: true },
    component: ConversationPage,
  },
  {
    path: 'c/:conversationId',
    title: pageTitle('coachApp.chat.title'),
    data: { [PUSHED_ROUTE]: true },
    component: ConversationPage,
  },
];
