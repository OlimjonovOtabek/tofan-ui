import { toPushConfig } from './push-config';

describe('toPushConfig', () => {
  const config = {
    apiKey: 'key',
    appId: '1:2:web:3',
    projectId: 'tofan-dev',
    messagingSenderId: '2',
  };

  it('should read the Firebase web app config when every field is filled', () => {
    expect(toPushConfig(config)).toEqual(config);
  });

  it('should keep the VAPID key when one is given', () => {
    expect(toPushConfig({ ...config, vapidKey: 'vapid' })).toEqual({
      ...config,
      vapidKey: 'vapid',
    });
  });

  it('should turn push off when the container has no Firebase project', () => {
    expect(toPushConfig(null)).toBeNull();
  });

  it('should turn push off when a field is missing or empty', () => {
    expect(toPushConfig({ ...config, appId: '' })).toBeNull();
    expect(toPushConfig({ apiKey: 'key', projectId: 'tofan-dev' })).toBeNull();
  });

  it('should ignore a VAPID key that is not text', () => {
    expect(toPushConfig({ ...config, vapidKey: 5 })).toEqual(config);
  });
});
