import { Post } from './post';
import {
  NO_POST_VIDEO,
  hasPostContent,
  pickedPostVideo,
  postDraftOf,
  postVideoOf,
  storedFileIdOf,
} from './post-draft';

const video = { videoUrl: '/v.mp4', hlsUrl: null, posterUrl: '/p.jpg' };

const stored: Post = {
  id: 'p1',
  authorName: 'Aziz',
  authorInitials: 'A',
  authorPhotoUrl: null,
  title: 'Title',
  text: 'Text',
  fileId: 'f1',
  createdOn: new Date(),
  updatedOn: new Date(),
  video,
};

describe('post drafts', () => {
  it('should start empty when there is no post', () => {
    expect(postDraftOf(null)).toEqual({ title: '', text: '' });
    expect(postVideoOf(null)).toEqual(NO_POST_VIDEO);
  });

  it('should start from the post and its stored video when editing', () => {
    expect(postDraftOf(stored)).toEqual({ title: 'Title', text: 'Text' });
    expect(postVideoOf(stored)).toEqual({ kind: 'stored', fileId: 'f1', source: video });
    expect(storedFileIdOf(postVideoOf(stored))).toBe('f1');
  });

  it('should start without a video when the post has none', () => {
    expect(postVideoOf({ ...stored, fileId: null, video: null })).toEqual(NO_POST_VIDEO);
  });

  it('should keep no stored file id for a picked video', () => {
    const picked = pickedPostVideo(new File(['x'], 'a.mp4'), 'blob:1');
    expect(picked.kind).toBe('picked');
    expect(storedFileIdOf(picked)).toBeNull();
  });

  it('should need some text or a video', () => {
    expect(hasPostContent({ title: 'T', text: '  ' }, NO_POST_VIDEO)).toBe(false);
    expect(hasPostContent({ title: 'T', text: 'x' }, NO_POST_VIDEO)).toBe(true);
    expect(hasPostContent({ title: 'T', text: '' }, postVideoOf(stored))).toBe(true);
  });
});
