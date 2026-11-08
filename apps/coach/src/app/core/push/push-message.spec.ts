import {
  isFailedVideoPush,
  pushDataFromLink,
  pushLinkOf,
  toPushData,
  toPushNotice,
} from './push-message';

describe('push messages', () => {
  it('should open the conversation of a chat push', () => {
    expect(pushLinkOf({ source: 'chat', conversationId: 'c 1' })).toBe('/chat/c/c%201');
    expect(pushLinkOf({ source: 'chat' })).toBe('/chat');
  });

  it('should open the program of a video on a saved day', () => {
    expect(pushLinkOf({ source: 'video', programId: 'p1', dayId: 'd1' })).toBe(
      '/programs/workout/p1',
    );
  });

  it('should open the preview videos of a preview video', () => {
    expect(pushLinkOf({ source: 'video', previewVideoId: 'v1' })).toBe('/profile/preview-videos');
  });

  it('should open the programs for a video the server could not place', () => {
    expect(pushLinkOf({ source: 'video', programId: 'p1' })).toBe('/programs');
  });

  it('should ignore an unknown push', () => {
    expect(pushLinkOf({ source: 'other' })).toBeNull();
  });

  it('should recognise a failed video', () => {
    expect(isFailedVideoPush({ source: 'video', type: '14' })).toBe(true);
    expect(isFailedVideoPush({ source: 'video', type: '13' })).toBe(false);
  });

  it('should read the title and body when the push carries both', () => {
    expect(toPushNotice({ title: 'Hello', body: 'World' })).toEqual({
      title: 'Hello',
      body: 'World',
    });
  });

  it('should read an empty body when the push carries only a title', () => {
    expect(toPushNotice({ title: 'Hello' })).toEqual({ title: 'Hello', body: '' });
  });

  it('should read no notice when the push carries no title', () => {
    expect(toPushNotice({ body: 'World' })).toBeNull();
    expect(toPushNotice({ title: '' })).toBeNull();
    expect(toPushNotice({})).toBeNull();
  });

  it('should keep only the text values', () => {
    expect(toPushData({ a: 'x', b: 1 })).toEqual({ a: 'x' });
    expect(toPushData(null)).toEqual({});
  });

  it('should read the data of a launch link and survive a broken one', () => {
    expect(pushDataFromLink('{"source":"chat"}')).toEqual({ source: 'chat' });
    expect(pushDataFromLink('{broken')).toBeNull();
    expect(pushDataFromLink(null)).toBeNull();
  });
});
