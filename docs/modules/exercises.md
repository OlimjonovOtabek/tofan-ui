# Exercises feature

## Purpose
The admin keeps the exercise catalog the mobile app builds workouts from: search and filter,
create and edit in three languages, attach a video, activate or deactivate, delete.

## Backend
- Base route: `/exercises` (backend Workout module)
- Endpoints used: `GET /exercises` (paged, filters `Search`, `MuscleGroup`, `EquipmentType`, `Gender`,
  `IsHomeExercise`, `IsActive`), `POST /exercises`, `PUT /exercises/{id}`, `DELETE /exercises/{id}`,
  `POST /exercises/{id}/activate`, `POST /exercises/{id}/deactivate`, `POST /files` (video upload)
- Access (backend policy): writes need `Policies.Admin`; `GET` needs authentication only
- Error codes handled: `Exercise.NotFound` (generic not-found message), `StoredFile.*` from the upload

## Screens
| Route | Page | Access |
|---|---|---|
| `/exercises` | `pages/exercises-page` | `authGuard` (admin role) |

## Structure notes
- `components/exercise-filters` owns the filter form and emits an `ExerciseFilter` 400 ms after the
  last change; the page passes it to `ExercisesStore.applyFilter`, which resets to the first page.
- `components/exercise-form-dialog` uses `shared/components/form-dialog`,
  `localized-text-field` and `file-upload` (category `exerciseVideo`).
- The edit dialog plays the saved video from `videoUrl` (API v9.1, a signed path such as
  `/files/{id}/content?expires=...&signature=...`). `ExercisesService` turns it into a full URL with
  `ApiClient.url` and `Exercise.playableVideoUrl(currentVideoFileId)` decides if the player shows: only
  while the video the form holds is still the saved one. A new upload or a removed video hides it (the new
  file has no signed link yet); a failed load shows a hint to reopen the exercise. The list has no player.
- `models/exercise-draft.ts` trims text and requires the name in every language before any request.
- Backend enums are integers; `services/exercise.mapper.ts` maps them by name. `MuscleGroup` and
  `EquipmentType` start at 0, `ExerciseType` and `ExerciseDifficulty` at 1.

- Names are a `LocalizedText` (`en`, `uz`, `ru`) shown with `pickLocalized` in the current language (fallback uz → en → ru); the name column sorts by `name`, `name_uz` or `name_ru` to match (2026-09-19, i18n).

## Traps
- Never build a video link from `videoFileId`: once the backend turns video protection on, `/files/{id}/content`
  without a signature answers `400 StoredFile.LinkInvalid`. The signed link lives at least 6 hours.
- Sorting sends snake_case `SortField` (`name_uz`); a camelCase name is silently replaced by `id`.
