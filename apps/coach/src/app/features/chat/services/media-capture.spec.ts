import { VOICE_FORMATS } from '../models/voice-note';
import {
  MediaDeniedError,
  MediaUnavailableError,
  openMedia,
  supportedFormat,
} from './media-capture';

describe('media capture', () => {
  const getUserMedia = vi.fn<MediaDevices['getUserMedia']>();

  beforeEach(() => {
    getUserMedia.mockReset();
    vi.stubGlobal('MediaRecorder', { isTypeSupported: (type: string) => type === 'audio/mp4' });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should pick the first format the browser can record', () => {
    expect(supportedFormat(VOICE_FORMATS).fileName).toBe('voice.m4a');
  });

  it('should report a missing recorder when no format is supported', () => {
    vi.stubGlobal('MediaRecorder', { isTypeSupported: () => false });

    expect(() => supportedFormat(VOICE_FORMATS)).toThrow(MediaUnavailableError);
  });

  it('should report blocked access when the browser refuses the camera or microphone', async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    await expect(openMedia({ audio: true })).rejects.toBeInstanceOf(MediaDeniedError);

    getUserMedia.mockRejectedValueOnce(new DOMException('insecure', 'SecurityError'));
    await expect(openMedia({ video: true })).rejects.toBeInstanceOf(MediaDeniedError);
  });

  it('should report a missing device for any other failure', async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException('none', 'NotFoundError'));

    await expect(openMedia({ video: true })).rejects.toBeInstanceOf(MediaUnavailableError);
  });
});
