import { Exercise } from '@domain/exercises/entities/exercise';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';
import { FindFileUsagesUseCase } from './find-file-usages.use-case';

function exercise(id: string, videoFileId: string | null): Exercise {
  return new Exercise(
    id,
    `Exercise ${id}`,
    `Mashq ${id}`,
    `Упражнение ${id}`,
    'chest',
    'barbell',
    'beginner',
    'strength',
    'any',
    true,
    false,
    true,
    null,
    videoFileId,
  );
}

describe('FindFileUsagesUseCase', () => {
  let exerciseRepository: ExerciseRepository;

  beforeEach(() => {
    exerciseRepository = {
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      setActive: vi.fn(),
    };
  });

  it('names the exercises whose video is the file', async () => {
    vi.mocked(exerciseRepository.list).mockResolvedValue({
      items: [exercise('1', 'video'), exercise('2', null), exercise('3', 'other')],
      totalCount: 3,
    });

    await expect(new FindFileUsagesUseCase(exerciseRepository).execute('video')).resolves.toEqual([
      { kind: 'exerciseVideo', ownerId: '1', ownerName: 'Mashq 1' },
    ]);
    expect(exerciseRepository.list).toHaveBeenCalledWith({}, { first: 0, rows: 1000 });
  });

  it('reads the whole catalog, not just the first page', async () => {
    vi.mocked(exerciseRepository.list)
      .mockResolvedValueOnce({ items: [exercise('1', null)], totalCount: 1500 })
      .mockResolvedValueOnce({ items: [exercise('1001', 'video')], totalCount: 1500 });

    const usages = await new FindFileUsagesUseCase(exerciseRepository).execute('video');

    expect(usages.map((usage) => usage.ownerId)).toEqual(['1001']);
    expect(exerciseRepository.list).toHaveBeenLastCalledWith({}, { first: 1000, rows: 1000 });
  });
});
