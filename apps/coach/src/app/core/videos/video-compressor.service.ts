import { Injectable } from '@angular/core';
import type { Input, InputVideoTrack } from 'mediabunny';
import {
  COPY_AUDIO_BITRATE,
  COPY_VIDEO_BITRATE,
  copyFileName,
  copyFrameRate,
  copySize,
  isWorthCompressing,
} from './video-compression';

const COPY_PREFIX = 'tofan-video-';
const STALE_COPY_MS = 24 * 60 * 60 * 1000;
const FRAME_RATE_SAMPLE_PACKETS = 50;

export interface VideoCopy {
  readonly file: File;
  discard(): Promise<void>;
}

export interface VideoCompression {
  readonly source: File;
  readonly onProgress: (progress: number) => void;
  readonly signal: AbortSignal;
}

@Injectable({ providedIn: 'root' })
export class VideoCompressorService {
  private queue: Promise<unknown> = Promise.resolve();

  compress(compression: VideoCompression): Promise<VideoCopy> {
    const result = this.queue.then(() => this.compressOrSendSource(compression));
    this.queue = result;
    return result;
  }

  private async compressOrSendSource(compression: VideoCompression): Promise<VideoCopy> {
    if (compression.signal.aborted) {
      return untouched(compression.source);
    }
    try {
      return await this.compressInBrowser(compression);
    } catch {
      return untouched(compression.source);
    }
  }

  private async compressInBrowser(compression: VideoCompression): Promise<VideoCopy> {
    const { source } = compression;
    const { ALL_FORMATS, BlobSource, Input } = await import('mediabunny');
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(source) });
    const track = await input.getPrimaryVideoTrack();
    if (track === null || !(await isWorthCompressingTrack(track, source))) {
      return untouched(source);
    }
    const folder = await navigator.storage.getDirectory();
    await removeStaleCopies(folder);
    return this.writeCopy(compression, input, track, folder);
  }

  private async writeCopy(
    compression: VideoCompression,
    input: Input,
    track: InputVideoTrack,
    folder: FileSystemDirectoryHandle,
  ): Promise<VideoCopy> {
    const name = `${COPY_PREFIX}${crypto.randomUUID()}.mp4`;
    const handle = await folder.getFileHandle(name, { create: true });
    const discard = () => removeCopy(folder, name);
    try {
      await convert(compression, input, track, await handle.createWritable());
      const written = await handle.getFile();
      if (written.size === 0 || written.size >= compression.source.size) {
        throw new Error('The copy is not smaller than the source.');
      }
      const fileName = copyFileName(compression.source.name);
      return { file: new File([written], fileName, { type: 'video/mp4' }), discard };
    } catch (error) {
      await discard();
      throw error;
    }
  }
}

async function convert(
  { onProgress, signal }: VideoCompression,
  input: Input,
  track: InputVideoTrack,
  target: FileSystemWritableFileStream,
): Promise<void> {
  const { Conversion, Mp4OutputFormat, Output, StreamTarget } = await import('mediabunny');
  const stats = await track.computePacketStats(FRAME_RATE_SAMPLE_PACKETS);
  const conversion = await Conversion.init({
    input,
    output: new Output({ format: new Mp4OutputFormat(), target: new StreamTarget(target) }),
    showWarnings: false,
    video: {
      ...copySize({ width: track.displayWidth, height: track.displayHeight }),
      fit: 'contain',
      codec: 'avc',
      bitrate: COPY_VIDEO_BITRATE,
      frameRate: copyFrameRate(stats.averagePacketRate),
      forceTranscode: true,
    },
    audio: { codec: 'aac', bitrate: COPY_AUDIO_BITRATE },
  });
  if (!conversion.isValid) {
    throw new Error('The browser cannot make a copy of this video.');
  }
  conversion.onProgress = onProgress;
  signal.addEventListener('abort', () => void conversion.cancel(), { once: true });
  await conversion.execute();
  if (signal.aborted) {
    throw new Error('The copy was cancelled.');
  }
}

function untouched(file: File): VideoCopy {
  return { file, discard: () => Promise.resolve() };
}

async function isWorthCompressingTrack(track: InputVideoTrack, source: File): Promise<boolean> {
  return (
    (await track.canDecode()) &&
    isWorthCompressing({
      width: track.displayWidth,
      height: track.displayHeight,
      bytes: source.size,
      highDynamicRange: await track.hasHighDynamicRange(),
    })
  );
}

async function removeCopy(folder: FileSystemDirectoryHandle, name: string): Promise<void> {
  await folder.removeEntry(name).catch(leaveCopyForTheNextCleanup);
}

async function removeStaleCopies(folder: FileSystemDirectoryHandle): Promise<void> {
  for await (const [name, handle] of folder.entries()) {
    if (name.startsWith(COPY_PREFIX) && isFileHandle(handle)) {
      const file = await handle.getFile();
      if (Date.now() - file.lastModified > STALE_COPY_MS) {
        await removeCopy(folder, name);
      }
    }
  }
}

function isFileHandle(handle: FileSystemHandle): handle is FileSystemFileHandle {
  return handle.kind === 'file';
}

function leaveCopyForTheNextCleanup(): void {
  return;
}
