export const CHAT_ACTIVITIES = ['typing', 'recordingVoice', 'recordingVideo', 'uploading'] as const;
export type ChatActivity = (typeof CHAT_ACTIVITIES)[number];

export const ACTIVITY_INTERVAL_MS = 3000;
export const ACTIVITY_SHOWN_MS = 5000;

export interface ActivityNotice {
  readonly conversationId: string;
  readonly userId: string;
  readonly activity: ChatActivity;
}

export interface SentActivity {
  readonly activity: ChatActivity;
  readonly at: number;
}

export function shouldSendActivity(
  last: SentActivity | undefined,
  activity: ChatActivity,
  now: number,
): boolean {
  return last === undefined || last.activity !== activity || now - last.at >= ACTIVITY_INTERVAL_MS;
}
