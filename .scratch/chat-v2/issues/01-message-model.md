# 01 Message model and contract

Status: resolved

- `MessageKind` and `Attachment` models, DTO enum for `kind`, `attachments` and `lastMessageKind` in the DTOs, mapper with absolute URLs.
- `text` may be `""`.
- File categories 8-11 (`chatImage`, `chatVoice`, `chatVideoNote`, `chatFile`) in `libs/shared` with the backend extensions and size limits.
- Admin media keeps working when `GET /files` returns chat files; chat categories are not offered in the admin upload dialog.
- Tests: mapper, rules, enum map.
