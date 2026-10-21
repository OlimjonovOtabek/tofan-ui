# Media feature

## Purpose

The admin sees every uploaded file (from the panel and the mobile app), previews images and videos,
copies a file id, uploads a standalone file (category, optional caption) and deletes files that are
no longer needed.

## Backend

- Base route: `/files` (backend Storage module)
- Endpoints used: `POST /files` (multipart: `file`, `category`, optional `caption` up to 500 chars), `GET /files` (paged, sortable by name, size, date), `DELETE /files/{id}`,
  `GET /files/{id}/content` (anonymous, used directly in `img`/`video`), `GET /exercises` and
  `GET/PUT /exercises/{id}` (attach an uploaded video, through `ExerciseVideosService` and its own DTO)
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
- An exercise video must name its exercise (one video per exercise). The picker lists only exercises
  without a video: `ExerciseVideosService.listWithoutVideo` reads the whole catalog in pages of 1000
  and filters in the panel, because the backend has no "has video" filter. After the upload
  `attachVideo` re-reads the exercise, refuses with `Exercise.VideoAlreadyAttached` (a panel code) if a
  video appeared meanwhile, and otherwise sends the full exercise back with `videoFileId`. If attaching
  fails, the uploaded file is deleted so no orphan is left.
- Preview and download links (API v9.1): `MediaStore.load` reads the file page and, in parallel, the whole
  exercise catalog through `ExerciseVideosService.listSignedVideoUrls`, which maps each `videoFileId` to its
  signed `videoUrl`. `MediaStore.contentUrl` returns that signed link for a video an exercise uses and the plain
  `/files/{id}/content` link for everything else (images are public, and so is any video no exercise uses).
  If the catalog cannot be read the list still loads and every link is the plain one; when a plain video link
  stops working the preview shows its existing `previewFailed` state.
- The backend refuses to delete a file that is still used; the panel no longer checks usages itself.

- The exercise picker shows each exercise in the admin's language and sorts with `localeCompare` for that language (`sortByName`), so Uzbek order follows the Uzbek alphabet (sh after s).

## Traps

- Only exercise videos are attached from this page. Other categories (images, avatars, documents)
  are uploaded unattached.
- "One video per exercise" is enforced by the panel only; the backend `PUT /exercises/{id}` accepts any
  `videoFileId`, and the exercise form can still replace a video.
- Only exercise videos are guarded by the backend today; other owners (food images, avatars) are
  not checked yet.
- Video protection (backend API v9.1): once it is on, `/files/{id}/content` of a video needs a signed link.
  Only `videoUrl` from `GET /exercises` is signed, so a video that no exercise uses cannot be previewed or
  downloaded until the backend adds `contentUrl` to `GET /files`; the request is in
  [backend-requests.md](../backend-requests.md).
