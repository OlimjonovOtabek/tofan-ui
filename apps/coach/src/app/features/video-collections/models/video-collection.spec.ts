import {
  MAX_COLLECTIONS,
  MAX_COLLECTION_VIDEOS,
  collectionLink,
  collectionUploadGroup,
  hasRoomForCollection,
  hasRoomForVideo,
  moved,
} from './video-collection';

describe('video collection rules', () => {
  it('should allow a new collection only below the limit of 20', () => {
    expect(hasRoomForCollection(MAX_COLLECTIONS - 1)).toBe(true);
    expect(hasRoomForCollection(MAX_COLLECTIONS)).toBe(false);
  });

  it('should count a video still uploading against the limit of 50', () => {
    expect(hasRoomForVideo(MAX_COLLECTION_VIDEOS - 1, false)).toBe(true);
    expect(hasRoomForVideo(MAX_COLLECTION_VIDEOS - 1, true)).toBe(false);
  });

  it('should move an item to its new place', () => {
    expect(moved(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moved(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('should not move when the place is the same or out of range', () => {
    expect(moved(['a', 'b'], 1, 1)).toBeNull();
    expect(moved(['a', 'b'], 0, 5)).toBeNull();
    expect(moved(['a', 'b'], -1, 0)).toBeNull();
  });

  it('should name the upload group and link of a collection', () => {
    expect(collectionUploadGroup('c1')).toBe('video-collection:c1');
    expect(collectionLink('c 1')).toBe('/profile/video-collections/c%201');
  });
});
