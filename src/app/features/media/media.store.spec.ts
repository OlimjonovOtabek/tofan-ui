import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { MediaStore } from './media.store';
import { StoredFile } from './models/stored-file';
import { MediaService } from './services/media.service';
import { ExerciseVideoResponse } from './services/stored-file.dto';

function exercise(id: string, videoFileId: string | null): ExerciseVideoResponse {
  return { id, name: `Exercise ${id}`, nameUz: `Mashq ${id}`, videoFileId };
}

describe('MediaStore', () => {
  const video = new StoredFile(
    'video',
    'exerciseVideo',
    'squat.mp4',
    'video/mp4',
    10,
    new Date(),
    null,
  );

  let listExerciseVideos: ReturnType<typeof vi.fn>;

  function createStore(): MediaStore {
    TestBed.configureTestingModule({
      providers: [
        MediaStore,
        { provide: MediaService, useValue: { listExerciseVideos } },
        { provide: NotificationService, useValue: { error: vi.fn(), success: vi.fn() } },
      ],
    });
    return TestBed.inject(MediaStore);
  }

  beforeEach(() => {
    listExerciseVideos = vi.fn();
  });

  it('should name the exercises when their video is the file', async () => {
    listExerciseVideos.mockResolvedValue({
      data: [exercise('1', 'video'), exercise('2', null), exercise('3', 'other')],
      totalCount: 3,
    });

    await expect(createStore().findUsages(video)).resolves.toEqual([
      { kind: 'exerciseVideo', ownerId: '1', ownerName: 'Mashq 1' },
    ]);
    expect(listExerciseVideos).toHaveBeenCalledWith({ first: 0, rows: 1000 });
  });

  it('should read the whole catalog when it spans several pages', async () => {
    listExerciseVideos
      .mockResolvedValueOnce({ data: [exercise('1', null)], totalCount: 1500 })
      .mockResolvedValueOnce({ data: [exercise('1001', 'video')], totalCount: 1500 });

    const usages = await createStore().findUsages(video);

    expect(usages?.map((usage) => usage.ownerId)).toEqual(['1001']);
    expect(listExerciseVideos).toHaveBeenLastCalledWith({ first: 1000, rows: 1000 });
  });
});
