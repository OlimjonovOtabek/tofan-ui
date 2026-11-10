# Chat v2 stage run (2026-11-09)

Coach panel on `npm run start:coach:staging` against `api.stage.peaktofan.com`, headless Chromium with a fake microphone, signed in as the stage coach.

## Checklist from the backend brief (trainer panel)

- [x] Message model: `kind`, `attachments`; `text` may be an empty string
- [x] Images and files sent (`category` 8, 11)
- [x] Voice message (`MediaRecorder`, `category` 9)
- [x] All four kinds shown, round video included
- [x] `lastMessageKind` in the conversation list
- [x] `Activity` called and `UserActivity` shown

## What was checked on stage

- Sent to Otabek Olimjonov (`73f8e8f0-90a3-49e2-b42a-3111072bceb4`), 3 messages: a 2-image album with a caption, a PDF, a 3-second voice message.
  Every `POST /files` and `POST …/messages` answered 200; the backend converted the webm voice to `.m4a` with a waveform.
- Shown from the "Sub User" conversation (sent from the mobile app): 4 round videos (480×480, muted autoplay, sound on click, progress ring) and 2 voice messages (play, pause, 1x speed pill, elapsed time).
- Hub frames: `Activity` with 1 while typing and 2 while recording; Esc cancels the recording and nothing is sent.
- Phone width (390 px): conversation, list and gallery fit without horizontal scroll.

## Found and fixed during the run

- Round videos autoplayed with sound: a static `muted` attribute does not mute an element Angular creates; now `[muted]="true"`.
- A 1 px black box around round videos and upload rings: the class `ring` matched the Tailwind utility; renamed to `progress-ring`.
- Live recording bars stayed flat: the linear meter left normal speech near zero; the meter now uses a decibel scale.
- The gallery opened with a focus ring on the download button; focus now goes to the dialog.
- A pending album with 2 images left an empty third column; the grid now has as many columns as images, up to 3.

## Not checked on stage

- Receiving `UserActivity` from the mobile app (needs the athlete's phone); covered by store tests.
- An expired signed URL in a long-open tab (needs an hour); covered by the merge and `MediaLinks` tests.
- Safari recording (`audio/mp4` → `voice.m4a`); covered by the format test only.

## Round video recording (2026-11-10)

- Sent 1 round video to Otabek Olimjonov from the panel with the fake camera: `POST /files` and `POST …/messages` answered 200, and the backend returned a 3 second 480×480 video note that plays in the conversation.
- Hub frames: `Activity` 3 while recording and 4 while uploading.
- Esc closes the recorder, both camera and microphone tracks end, and nothing is sent.
- Found and fixed: the attach menu wrapped "Video message" and its hint onto two lines at phone width; the menu is wider and its labels stay on one line.
