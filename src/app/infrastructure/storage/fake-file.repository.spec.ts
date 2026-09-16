import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { firstPage } from '@domain/shared/paging/page';
import { FAKE_SQUAT_VIDEO_ID } from '@infrastructure/exercises/fake-exercise.repository';
import { FakeFileRepository } from './fake-file.repository';

describe('FakeFileRepository', () => {
  let repository: FakeFileRepository;

  beforeEach(() => {
    repository = new FakeFileRepository();
  });

  it('seeds the video the fake squat exercise points at', async () => {
    await expect(repository.getById(FAKE_SQUAT_VIDEO_ID)).resolves.toMatchObject({
      category: 'exerciseVideo',
    });
  });

  it('sorts the way the table asks', async () => {
    const newestFirst = await repository.list({
      ...firstPage(),
      sortField: 'createdOnUtc',
      sortDirection: 'desc',
    });
    const smallestFirst = await repository.list({
      ...firstPage(),
      sortField: 'size',
      sortDirection: 'asc',
    });

    expect(newestFirst.items[0].originalName).toBe('plov.jpg');
    expect(smallestFirst.items.map((file) => file.size)).toEqual(
      [...smallestFirst.items.map((file) => file.size)].sort((a, b) => a - b),
    );
  });

  it('forgets a deleted file', async () => {
    await repository.delete(FAKE_SQUAT_VIDEO_ID);

    await expect(repository.getById(FAKE_SQUAT_VIDEO_ID)).rejects.toThrow(NotFoundError);
    await expect(repository.list(firstPage())).resolves.toMatchObject({ totalCount: 3 });
  });

  it('offers a preview only for images', async () => {
    const { items } = await repository.list(firstPage());

    for (const file of items) {
      expect(repository.contentUrl(file.id).length > 0).toBe(file.isImage());
    }
  });
});
