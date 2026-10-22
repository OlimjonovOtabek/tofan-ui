import { appStoreUrlFor } from './app-download';
import { EXTERNAL_LINKS } from './external-links';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';

describe('appStoreUrlFor', () => {
  it('should send to the App Store when the device is an iPhone', () => {
    expect(appStoreUrlFor(IPHONE)).toBe(EXTERNAL_LINKS.appStore);
  });

  it('should send to Google Play when the device is an Android phone', () => {
    expect(appStoreUrlFor(ANDROID)).toBe(EXTERNAL_LINKS.googlePlay);
  });

  it('should send to Google Play when the user agent is missing', () => {
    expect(appStoreUrlFor(undefined)).toBe(EXTERNAL_LINKS.googlePlay);
  });
});
