import { toSessionDevice } from './session-device';

describe('toSessionDevice', () => {
  it('should say nothing is known when an older session has no user agent', () => {
    expect(toSessionDevice(null)).toEqual({ kind: 'unknown', name: null });
    expect(toSessionDevice('  ')).toEqual({ kind: 'unknown', name: null });
  });

  it('should read the app version, the device and the system when the Tofan app names itself', () => {
    expect(toSessionDevice('Tofan/9.19 (iPhone; iOS 19.1)')).toEqual({
      kind: 'app',
      name: 'Tofan 9.19 · iPhone · iOS 19.1',
    });
  });

  it('should call it the app without details when the mobile app sends the default Dart agent', () => {
    expect(toSessionDevice('Dart/3.11 (dart:io)')).toEqual({ kind: 'app', name: null });
  });

  it('should name Chrome on Android when an Android phone signs in from the browser', () => {
    expect(
      toSessionDevice(
        'Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
      ),
    ).toEqual({ kind: 'browser', name: 'Chrome · Android 14' });
  });

  it('should name Chrome on macOS when the panel is opened on a Mac', () => {
    expect(
      toSessionDevice(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      ),
    ).toEqual({ kind: 'browser', name: 'Chrome · macOS' });
  });

  it('should name Safari on iOS when an iPhone signs in from Safari', () => {
    expect(
      toSessionDevice(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
      ),
    ).toEqual({ kind: 'browser', name: 'Safari · iOS 18.6' });
  });

  it('should name Edge before Chrome when the agent carries both', () => {
    expect(
      toSessionDevice(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      ),
    ).toEqual({ kind: 'browser', name: 'Edge · Windows' });
  });

  it('should show the first product token when a script or a tool signs in', () => {
    expect(toSessionDevice('Python-urllib/3.9')).toEqual({
      kind: 'other',
      name: 'Python-urllib/3.9',
    });
    expect(toSessionDevice('PostmanRuntime/7.43.0')).toEqual({
      kind: 'other',
      name: 'PostmanRuntime/7.43.0',
    });
  });
});
