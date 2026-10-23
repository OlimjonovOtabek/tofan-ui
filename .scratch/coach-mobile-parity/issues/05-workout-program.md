# 05 Workout program detail, create, edit and day editor

Status: resolved
Blocked by: 04

Match `create_program`, `workout_program_detail` and `workout_day_editor`.
Create or edit details: name, goal chips, level segmented control, place segmented control, days (create only, up to 7).
Detail: summary card with Edit details, numbered day tiles with ready or empty tags and a more menu (move up, move down, edit, delete), Add day, publish or unpublish, delete (only when unpublished).
Day editor: title, description (1000), videos with upload progress, retry, rename, remove, reorder by drag, watch, stream status tag from `GET /files/videos`, save enabled only when the title is set and every video is uploaded, legacy exercise note.
Days are sent as `{ title, description, videos: [{ fileId, name }] }`.
Remove the exercise-picker editor and its stores.

