# 06 Activity over SignalR

Status: resolved
Blocked by: 01

- `Activity(conversationId, activity)` replaces `Typing`: 1 while typing, 2 while recording voice, 4 while uploading; at most once per 3 s per activity.
- `UserActivity` replaces `UserTyping`; the header shows typing, recording voice, recording video or uploading; cleared after 5 s or on a message from that user.
