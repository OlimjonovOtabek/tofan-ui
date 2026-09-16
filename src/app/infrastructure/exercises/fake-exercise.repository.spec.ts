import { ExerciseDraft } from '@domain/exercises/exercise-draft';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { firstPage } from '@domain/shared/paging/page';
import { FakeExerciseRepository } from './fake-exercise.repository';

const draft: ExerciseDraft = {
  name: 'Deadlift',
  nameUz: 'Yerdan koʻtarish',
  nameRu: 'Становая тяга',
  muscleGroup: 'back',
  equipmentType: 'barbell',
  difficulty: 'advanced',
  type: 'strength',
  gender: 'any',
  isCompound: true,
  isHomeExercise: false,
  instructions: null,
  videoFileId: null,
};

describe('FakeExerciseRepository', () => {
  let repository: FakeExerciseRepository;

  beforeEach(() => {
    repository = new FakeExerciseRepository();
  });

  it('answers with the seeded catalog', async () => {
    const page = await repository.list({}, firstPage());

    expect(page.totalCount).toBe(3);
    expect(page.items).toHaveLength(3);
  });

  it('narrows the list by the filters the page sends', async () => {
    await expect(repository.list({ search: 'planka' }, firstPage())).resolves.toMatchObject({
      totalCount: 1,
    });
    await expect(repository.list({ muscleGroup: 'abs' }, firstPage())).resolves.toMatchObject({
      totalCount: 1,
    });
    await expect(repository.list({ isActive: false }, firstPage())).resolves.toMatchObject({
      totalCount: 1,
    });
    await expect(
      repository.list({ muscleGroup: 'abs', isActive: true }, firstPage()),
    ).resolves.toMatchObject({ totalCount: 0 });
  });

  it('returns only the requested window', async () => {
    const page = await repository.list({}, { first: 2, rows: 2 });

    expect(page.items).toHaveLength(1);
    expect(page.totalCount).toBe(3);
  });

  it('creates, updates and deletes', async () => {
    const id = await repository.create(draft);
    await expect(repository.getById(id)).resolves.toMatchObject({ name: 'Deadlift' });

    await repository.update(id, { ...draft, name: 'Romanian deadlift' });
    await expect(repository.getById(id)).resolves.toMatchObject({ name: 'Romanian deadlift' });

    await repository.delete(id);
    await expect(repository.getById(id)).rejects.toThrow(NotFoundError);
  });

  it('keeps activation out of the update payload', async () => {
    const id = await repository.create(draft);

    await repository.setActive(id, false);
    await repository.update(id, { ...draft, name: 'Deadlift 2' });

    await expect(repository.getById(id)).resolves.toMatchObject({
      name: 'Deadlift 2',
      isActive: false,
    });
  });

  it('fails loudly for an exercise that is gone', async () => {
    await expect(repository.setActive('missing', true)).rejects.toThrow(NotFoundError);
  });
});
