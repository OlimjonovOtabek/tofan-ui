import {
  MicrophoneDeniedError,
  MicrophoneUnavailableError,
  VoiceRecorder,
} from './voice-recorder.service';

describe('VoiceRecorder', () => {
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

  it('should report a missing recorder when the browser has no supported format', async () => {
    vi.stubGlobal('MediaRecorder', { isTypeSupported: () => false });

    await expect(new VoiceRecorder().start()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('should report a blocked microphone when the browser refuses access', async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    await expect(new VoiceRecorder().start()).rejects.toBeInstanceOf(MicrophoneDeniedError);

    getUserMedia.mockRejectedValueOnce(new DOMException('insecure', 'SecurityError'));
    await expect(new VoiceRecorder().start()).rejects.toBeInstanceOf(MicrophoneDeniedError);
  });

  it('should report a missing microphone for any other failure', async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException('none', 'NotFoundError'));

    await expect(new VoiceRecorder().start()).rejects.toBeInstanceOf(MicrophoneUnavailableError);
  });
});
