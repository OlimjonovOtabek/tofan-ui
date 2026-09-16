import { NotificationTemplateDraft } from '@domain/notifications/notification-template-draft';
import { ConflictError } from '@domain/shared/errors/conflict.error';
import { firstPage } from '@domain/shared/paging/page';
import { FakeNotificationTemplateRepository } from './fake-notification-template.repository';

const draft: NotificationTemplateDraft = {
  type: 'workoutReminder',
  trainerStyle: 'professional',
  title: 't',
  titleUz: 't',
  titleRu: 't',
  body: 'b',
  bodyUz: 'b',
  bodyRu: 'b',
  isActive: true,
};

describe('FakeNotificationTemplateRepository', () => {
  let repository: FakeNotificationTemplateRepository;

  beforeEach(() => {
    repository = new FakeNotificationTemplateRepository();
  });

  it('refuses a second active template for the same type and style, as the backend does', async () => {
    await expect(repository.create(draft)).rejects.toThrow(ConflictError);
  });

  it('accepts it inactive, or in another style', async () => {
    await expect(repository.create({ ...draft, isActive: false })).resolves.toBeTypeOf('string');
    await expect(repository.create({ ...draft, trainerStyle: 'soft' })).resolves.toBeTypeOf(
      'string',
    );
    await expect(repository.list(firstPage())).resolves.toMatchObject({ totalCount: 5 });
  });

  it('lets a template be saved again without clashing with itself', async () => {
    const [professional] = (await repository.list(firstPage())).items;

    await expect(repository.update(professional.id, draft)).resolves.toBeUndefined();
  });
});
