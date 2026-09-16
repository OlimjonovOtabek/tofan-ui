# Media feature

## Purpose
The admin sees every uploaded file (from the panel and the mobile app), previews images and videos,
copies a file id and deletes files that are no longer needed.

## Backend
- Base route: `/files` (backend Storage module)
- Endpoints used: `GET /files` (paged, sortable by name, size, date), `DELETE /files/{id}`,
  `GET /files/{id}/content` (anonymous, used directly in `img`/`video`), `GET /exercises` (usage check)
- Access (backend policy): authentication only — see `docs/deferred.md`
- Error codes handled: `StoredFile.NotFound` (generic not-found message)

## Screens
| Route | Page | Access |
|---|---|---|
| `/media` | `pages/media-page` | `authGuard` (admin role) |

## Structure notes
- There is no upload on this screen: files are uploaded from the form they belong to, otherwise
  orphaned files appear.
- Before a delete, `MediaStore.findUsages` reads the whole exercise catalog in pages of 1000 through
  `MediaService.listExerciseVideos` (its own `ExerciseVideoResponse` DTO, not the exercises feature)
  and lists exercises whose video is the file in the confirmation.

## Traps
- The backend deletes a file without checking references; the usage check is the only guard.
- Only exercise videos are checked; add new owners (food images, avatars) when those forms upload files.
- `GET /files` and `DELETE /files/{id}` are not admin-only on the backend.
