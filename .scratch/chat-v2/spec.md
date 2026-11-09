# Coach chat v2: images, files, voice and round video

Backend source: `backend-chat-v2.md` (copy of the backend team's `docs/chat-v2.md`, 2026-11-08) and the Telegram brief of 2026-11-09.
Contract checked against the stage Swagger (`https://api.stage.peaktofan.com/swagger/v1/swagger.json`) on 2026-11-09.
Design: https://claude.ai/artifact/DsRbNAFVNHeXmd3yPJVn2L (conversation with all four kinds, composer states, conversation list, gallery).

## Goal

The coach panel chat shows and sends the new message kinds that the mobile app already has on stage.

## Scope

- Message model: `kind` (1 text, 2 image, 3 file, 4 voice, 5 video note) and `attachments`; `text` may be an empty string.
- Send images (category 8, 1-10 per message, optional caption) and files (category 11, 1-10 per message, optional caption): upload with `POST /files`, then `POST /chat/conversations/{id}/messages` with `{ text, attachments: [fileId] }`.
- Send voice messages recorded with `MediaRecorder` (category 9, named `voice.webm`, `voice.m4a` or `voice.ogg` by container).
- Show all four kinds, round video included; recording a round video is out of scope for the panel.
- Conversation list shows `lastMessageKind`.
- SignalR: call `Activity(conversationId, activity)` and show `UserActivity` instead of `Typing` / `UserTyping`.

## Decisions

- Voice recording on the web starts with a click on the microphone and ends with the send button; Esc or the bin cancels.
  Press-and-hold is a phone gesture; on a desktop it makes long notes tiring.
- A recording under 1 second is not sent; recording stops on its own at 15 minutes (the backend limit).
- The attach menu has two entries, Image and File, so one message never mixes kinds (`Chat.AttachmentsMixed`).
- Pasting an image into the text field adds it as an image attachment.
- Sending media creates a pending bubble at the bottom of the conversation with upload progress; a failed send keeps the bubble with retry and discard.
- Signed URLs change every hour. The panel keeps the URL it already has for a file while that URL is valid (its `expires` is in the future), so a reload of messages does not refetch every image.
  When a media element fails to load, or a file is opened after its URL expired, the store refetches the page that holds the message and uses the new URL.
- Upload limits are checked in the browser before the upload (extensions and sizes from the backend table); the backend still decides.
- Backend error texts for the new codes come from the localized `messages` in the response.

## Out of scope

Recording round video, editing, deleting, forwarding and replying to messages, "listened" state for voice messages (the API has none), drag and drop of files.
