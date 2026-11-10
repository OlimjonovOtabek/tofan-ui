# 07 Record a round video

Status: resolved
Blocked by: 01, 03, 04

- Attach menu entry "Video message" opens the front camera in a modal circle with a 60 second ring and a timer.
- `MediaRecorder` webm (vp9 or vp8 with opus) or mp4 for Safari, named `video-note.webm` or `video-note.mp4`, uploaded with category 10.
- Send finishes, the bin or Esc cancels and releases the camera, under 1 second is dropped, 60 seconds stops on its own.
- `Activity` 3 while recording; the pending bubble plays the recorded file in a circle.
- Voice and video share `MediaRecordingStore` and `services/media-capture.ts`.
