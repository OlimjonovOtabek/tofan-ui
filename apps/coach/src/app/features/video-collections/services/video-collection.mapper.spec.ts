import {
  MediaUrl,
  toSaveVideoCollectionRequest,
  toUpdateCollectionVideoRequest,
  toVideoCollection,
  toVideoCollectionSummary,
} from './video-collection.mapper';

const media: MediaUrl = (path) => (path ? `/api${path}` : null);

describe('video collection mapper', () => {
  it('should map a collection of the list', () => {
    expect(
      toVideoCollectionSummary({
        id: 'c1',
        title: ' Grija ',
        description: null,
        isPublished: true,
        displayOrder: 0,
        videoCount: 3,
        createdOnUtc: '2026-11-08T09:00:00Z',
      }),
    ).toEqual({ id: 'c1', title: 'Grija', description: '', isPublished: true, videoCount: 3 });
  });

  it('should map a collection with its videos in their order', () => {
    const collection = toVideoCollection(
      {
        id: 'c1',
        title: 'Grija',
        description: ' Har kuni ',
        isPublished: false,
        createdOnUtc: '2026-11-08T09:00:00Z',
        videos: [
          {
            id: 'v2',
            fileId: 'f2',
            title: null,
            note: null,
            displayOrder: 1,
            videoUrl: null,
            hlsUrl: '/h2.m3u8',
            posterUrl: null,
          },
          {
            id: 'v1',
            fileId: 'f1',
            title: ' Planka ',
            note: ' 3 × 10 ',
            displayOrder: 0,
            videoUrl: '/v1.mp4',
            hlsUrl: null,
            posterUrl: '/p1.jpg',
          },
        ],
      },
      media,
    );

    expect(collection.description).toBe('Har kuni');
    expect(collection.videos).toEqual([
      {
        id: 'v1',
        fileId: 'f1',
        title: 'Planka',
        note: '3 × 10',
        videoUrl: '/api/v1.mp4',
        hlsUrl: null,
        posterUrl: '/api/p1.jpg',
      },
      {
        id: 'v2',
        fileId: 'f2',
        title: '',
        note: '',
        videoUrl: null,
        hlsUrl: '/api/h2.m3u8',
        posterUrl: null,
      },
    ]);
  });

  it('should send no empty description, video title or note', () => {
    expect(toSaveVideoCollectionRequest({ title: ' Grija ', text: ' ' })).toEqual({
      title: 'Grija',
      description: null,
    });
    expect(toUpdateCollectionVideoRequest({ title: ' ', text: ' Har kuni ' })).toEqual({
      title: null,
      note: 'Har kuni',
    });
  });
});
