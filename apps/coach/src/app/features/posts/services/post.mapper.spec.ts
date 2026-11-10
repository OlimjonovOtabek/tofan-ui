import { TrainerPostResponse } from './post.dto';
import { PostUrls, toPost, toSavePostRequest } from './post.mapper';

const urls: PostUrls = {
  fileContent: (fileId) => `/api/files/${fileId}/content`,
  media: (path) => (path ? `/api${path}` : null),
};

const response: TrainerPostResponse = {
  id: 'p1',
  trainerId: 't1',
  trainerUserId: 'u1',
  trainerDisplayName: ' Aziz  Karimov ',
  trainerPhotoFileId: 'ph',
  title: ' Bu hafta ',
  text: ' Ko‘proq suv iching ',
  fileId: 'f1',
  createdOnUtc: '2026-11-08T09:00:00Z',
  updatedOnUtc: '2026-11-08T09:10:00Z',
  videoUrl: '/v.mp4',
  hlsUrl: '/v.m3u8',
  posterUrl: '/p.jpg',
};

describe('post mapper', () => {
  it('should map a post with its author and video', () => {
    expect(toPost(response, urls)).toEqual({
      id: 'p1',
      authorName: 'Aziz  Karimov',
      authorInitials: 'AK',
      authorPhotoUrl: '/api/files/ph/content',
      title: 'Bu hafta',
      text: 'Ko‘proq suv iching',
      fileId: 'f1',
      createdOn: new Date('2026-11-08T09:00:00Z'),
      updatedOn: new Date('2026-11-08T09:10:00Z'),
      video: { videoUrl: '/api/v.mp4', hlsUrl: '/api/v.m3u8', posterUrl: '/api/p.jpg' },
    });
  });

  it('should map a text post without a video or photo', () => {
    const post = toPost(
      {
        ...response,
        trainerPhotoFileId: null,
        text: null,
        fileId: null,
        videoUrl: null,
        hlsUrl: null,
        posterUrl: null,
      },
      urls,
    );
    expect(post.video).toBeNull();
    expect(post.authorPhotoUrl).toBeNull();
    expect(post.text).toBe('');
  });

  it('should send a trimmed title and no empty text', () => {
    expect(toSavePostRequest({ title: ' T ', text: '  ' }, null)).toEqual({
      title: 'T',
      text: null,
      fileId: null,
    });
    expect(toSavePostRequest({ title: 'T', text: ' x ' }, 'f1')).toEqual({
      title: 'T',
      text: 'x',
      fileId: 'f1',
    });
  });
});
