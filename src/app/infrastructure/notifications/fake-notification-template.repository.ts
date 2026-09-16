import { Injectable } from '@angular/core';
import { NotificationTemplate } from '@domain/notifications/entities/notification-template';
import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';
import { ConflictError } from '@domain/shared/errors/conflict.error';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { Page, PageRequest } from '@domain/shared/paging/page';

const NETWORK_DELAY_MS = 250;
const SEEDED_AT = new Date('2026-09-01T09:00:00Z');

const SEED: readonly NotificationTemplate[] = [
  new NotificationTemplate(
    '11111111-1111-1111-1111-111111111111',
    'workoutReminder',
    'professional',
    'Time to train',
    'Mashg‘ulot vaqti',
    'Время тренировки',
    'Your workout for today is waiting.',
    'Bugungi mashg‘ulotingiz sizni kutmoqda.',
    'Ваша сегодняшняя тренировка ждёт.',
    true,
    SEEDED_AT,
    SEEDED_AT,
  ),
  new NotificationTemplate(
    '22222222-2222-2222-2222-222222222222',
    'workoutReminder',
    'aggressive',
    'No excuses',
    'Bahona yo‘q',
    'Без оправданий',
    'Get up and train. Now.',
    'Tur va mashq qil. Hozir.',
    'Вставай и тренируйся. Сейчас.',
    true,
    SEEDED_AT,
    SEEDED_AT,
  ),
  new NotificationTemplate(
    '33333333-3333-3333-3333-333333333333',
    'waterReminder',
    'soft',
    'A glass of water?',
    'Bir stakan suv?',
    'Стакан воды?',
    'A little water now will help you feel better.',
    'Hozir ozgina suv ichsangiz, o‘zingizni yaxshi his qilasiz.',
    'Немного воды сейчас поможет чувствовать себя лучше.',
    false,
    SEEDED_AT,
    SEEDED_AT,
  ),
];

/** In-memory templates for `useMockApi`, enforcing the backend's one-active-per-style rule. */
@Injectable({ providedIn: 'root' })
export class FakeNotificationTemplateRepository implements NotificationTemplateRepository {
  private templates = [...SEED];

  async list(page: PageRequest): Promise<Page<NotificationTemplate>> {
    await delay();
    return {
      items: this.templates.slice(page.first, page.first + page.rows),
      totalCount: this.templates.length,
    };
  }

  async getById(id: string): Promise<NotificationTemplate> {
    await delay();
    return this.find(id);
  }

  async create(draft: NotificationTemplateDraft): Promise<string> {
    await delay();
    this.ensureNoActiveTwin(draft, null);
    const id = crypto.randomUUID();
    const now = new Date();
    this.templates = [toTemplate(id, draft, now, now), ...this.templates];
    return id;
  }

  async update(id: string, draft: NotificationTemplateDraft): Promise<void> {
    await delay();
    const current = this.find(id);
    this.ensureNoActiveTwin(draft, id);
    this.templates = this.templates.map((template) =>
      template.id === id ? toTemplate(id, draft, current.createdAt, new Date()) : template,
    );
  }

  async delete(id: string): Promise<void> {
    await delay();
    this.find(id);
    this.templates = this.templates.filter((template) => template.id !== id);
  }

  /** Synchronous view for the fake sender, which needs to know what would be sent. */
  snapshot(): readonly NotificationTemplate[] {
    return this.templates;
  }

  private find(id: string): NotificationTemplate {
    const template = this.templates.find((candidate) => candidate.id === id);
    if (template === undefined) {
      throw new NotFoundError(
        'The notification template was not found.',
        'NotificationTemplate.NotFound',
      );
    }
    return template;
  }

  private ensureNoActiveTwin(draft: NotificationTemplateDraft, excludeId: string | null): void {
    const twin = this.templates.some(
      (template) =>
        template.id !== excludeId &&
        template.isActive &&
        template.type === draft.type &&
        template.trainerStyle === draft.trainerStyle,
    );
    if (draft.isActive && twin) {
      throw new ConflictError(
        'An active notification template already exists for the requested type and trainer style.',
        'NotificationTemplate.Conflict',
      );
    }
  }
}

function toTemplate(
  id: string,
  draft: NotificationTemplateDraft,
  createdAt: Date,
  updatedAt: Date,
): NotificationTemplate {
  return new NotificationTemplate(
    id,
    draft.type,
    draft.trainerStyle,
    draft.title,
    draft.titleUz,
    draft.titleRu,
    draft.body,
    draft.bodyUz,
    draft.bodyRu,
    draft.isActive,
    createdAt,
    updatedAt,
  );
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}
