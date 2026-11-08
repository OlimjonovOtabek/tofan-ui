export type PushData = Readonly<Record<string, string>>;

export interface PushNotice {
  readonly title: string;
  readonly body: string;
}

const CHAT_SOURCE = 'chat';
const VIDEO_SOURCE = 'video';
const VIDEO_FAILED_TYPE = '14';

export function pushLinkOf(data: PushData): string | null {
  if (data['source'] === CHAT_SOURCE) {
    const conversationId = data['conversationId'];
    return conversationId ? `/chat/c/${encodeURIComponent(conversationId)}` : '/chat';
  }
  if (data['source'] !== VIDEO_SOURCE) {
    return null;
  }
  if (data['programId'] && data['dayId']) {
    return `/programs/workout/${encodeURIComponent(data['programId'])}`;
  }
  return data['previewVideoId'] ? '/profile/preview-videos' : '/programs';
}

export function isFailedVideoPush(data: PushData): boolean {
  return data['source'] === VIDEO_SOURCE && data['type'] === VIDEO_FAILED_TYPE;
}

export function toPushNotice(message: PushData): PushNotice | null {
  const title = message['title'];
  return title ? { title, body: message['body'] ?? '' } : null;
}

export function toPushData(value: unknown): PushData {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]: [string, unknown]) =>
      typeof item === 'string' ? [[key, item]] : [],
    ),
  );
}

export function pushDataFromLink(encoded: string | null): PushData | null {
  if (encoded === null) {
    return null;
  }
  try {
    return toPushData(JSON.parse(encoded) as unknown);
  } catch {
    return null;
  }
}
