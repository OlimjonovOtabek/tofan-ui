# Media feature

## Purpose

The admin sees every uploaded file (from the panel and the mobile app), previews images and videos,
copies a file id, uploads a standalone file (category, optional caption) and deletes files that are
no longer needed.

## Backend

- Base route: `/files` (backend Storage module)
- Endpoints used: `POST /files` (multipart: `file`, `category`, optional `caption` up to 500 chars), `GET /files` (paged, sortable by name, size, date), `DELETE /files/{id}`,
  `GET /files/{id}/content` (anonymous, used directly in `img`/`video`)
- Access (backend policy): `GET /files` and `DELETE /files/{id}` need `Policies.Admin`
- Error codes handled: `StoredFile.InUse` (409, the file is an exercise video, also of an inactive
  exercise), `StoredFile.NotFound` (the list is refreshed), `StoredFile.Empty`,
  `StoredFile.UnsupportedContent`, `StoredFile.TooLarge` (checked before the request, same codes as the backend)

## Screens

| Route    | Page               | Access                   |
| -------- | ------------------ | ------------------------ |
| `/media` | `pages/media-page` | `authGuard` (admin role) |

## Structure notes

- Upload (2026-09-19, by request): `MediaUploadDialog` emits a `MediaUploadDraft`, `MediaStore.upload`
  applies `createMediaUpload` (file and category required, caption trimmed, max 500) and calls the shared
  `FileUploadService` with progress; the extension and size limits come from `shared/utils/file-upload-rules.ts`.
  After an upload the list goes back to the first page so the new file is visible.
- The backend refuses to delete a file that is still used; the panel no longer checks usages itself.

## Traps

- A file uploaded here is not attached to anything. The exercise form can only upload a new video,
  it cannot pick an existing file, so a file uploaded here stays unattached until deleted.
- Only exercise videos are guarded by the backend today; other owners (food images, avatars) are
  not checked yet.
