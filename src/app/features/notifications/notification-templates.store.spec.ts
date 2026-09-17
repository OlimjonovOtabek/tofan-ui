import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotificationTemplate } from './models/notification-template';
import { NotificationTemplateDraft } from './models/notification-template-draft';
import { NotificationTemplatesStore } from './notification-templates.store';
import { NotificationTemplatesService } from './services/notification-templates.service';

const draft: NotificationTemplateDraft = {
  type: 'waterReminder',
  trainerStyle: 'soft',
  title: ' A glass of water? ',
  titleUz: 'Bir stakan suv?',
  titleRu: 'Стакан воды?',
  body: 'Drink some water.',
  bodyUz: 'Ozgina suv iching.',
  bodyRu: 'Выпейте воды.',
  isActive: true,
};

const now = new Date('2026-09-16T00:00:00Z');
const template = new NotificationTemplate(
  '3',
  'waterReminder',
  'soft',
  'A glass of water?',
  'Bir stakan suv?',
  'Стакан воды?',
  'Drink some water.',
  'Ozgina suv iching.',
  'Выпейте воды.',
  true,
  now,
  now,
);

describe('NotificationTemplatesStore', () => {
  let service: Pick<NotificationTemplatesService, 'list' | 'create' | 'update' | 'delete'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): NotificationTemplatesStore {
    TestBed.configureTestingModule({
      providers: [
        NotificationTemplatesStore,
        { provide: NotificationTemplatesService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(NotificationTemplatesStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [template], totalCount: 1 }),
      create: vi.fn().mockResolvedValue('3'),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 0, rows: 10 });

    expect(store.templates()).toEqual([template]);
    expect(store.totalCount()).toBe(1);
    expect(service.list).toHaveBeenCalledWith({ first: 0, rows: 10 });
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.templates()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('should create a trimmed template when no id is given', async () => {
    const store = createStore();

    await expect(store.save(draft, null)).resolves.toBe(true);

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'A glass of water?' }),
    );
  });

  it('should update the template when an id is given', async () => {
    const store = createStore();

    await store.save(draft, '3');

    expect(service.update).toHaveBeenCalledWith(
      '3',
      expect.objectContaining({ type: 'waterReminder' }),
    );
  });

  it('should show the conflict when an active twin already exists', async () => {
    const conflict = new ConflictError('exists', 'NotificationTemplate.Conflict');
    vi.mocked(service.create).mockRejectedValue(conflict);
    const store = createStore();

    await expect(store.save(draft, null)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalledWith(conflict);
    expect(store.saving()).toBe(false);
  });

  it('should delete the template and reload when removing', async () => {
    const store = createStore();

    await store.remove(template);

    expect(service.delete).toHaveBeenCalledWith('3');
    expect(service.list).toHaveBeenCalled();
  });
});
