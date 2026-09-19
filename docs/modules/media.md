# Media feature

## Purpose

The admin sees every uploaded file (from the panel and the mobile app), previews images and videos,
copies a file id and deletes files that are no longer needed.

## Backend

- Base route: `/files` (backend Storage module)
- Endpoints used: `GET /files` (paged, sortable by name, size, date), `DELETE /files/{id}`,
  `GET /files/{id}/content` (anonymous, used directly in `img`/`video`)
- Access (backend policy): `GET /files` and `DELETE /files/{id}` need `Policies.Admin`
- Error codes handled: `StoredFile.InUse` (409, the file is an exercise video, also of an inactive
  exercise), `StoredFile.NotFound` (the list is refreshed)

## Screens

| Route    | Page               | Access                   |
| -------- | ------------------ | ------------------------ |
| `/media` | `pages/media-page` | `authGuard` (admin role) |

## Structure notes

- There is no upload on this screen: files are uploaded from the form they belong to, otherwise
  orphaned files appear.
- The backend refuses to delete a file that is still used; the panel no longer checks usages itself.

## Traps

- Only exercise videos are guarded by the backend today; other owners (food images, avatars) are
  not checked yet.
