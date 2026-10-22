import { LandingKey } from '@landing/core/i18n/landing-dictionary';

export interface FaqItem {
  readonly question: LandingKey;
  readonly answer: LandingKey;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  { question: 'faq.free.question', answer: 'faq.free.answer' },
  { question: 'faq.languages.question', answer: 'faq.languages.answer' },
  { question: 'faq.payment.question', answer: 'faq.payment.answer' },
  { question: 'faq.becomeCoach.question', answer: 'faq.becomeCoach.answer' },
];
