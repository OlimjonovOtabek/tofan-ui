# Soldiers feature

## Purpose

The main user list: people who finished onboarding. The admin searches and filters soldiers, opens a
read-only card (profile, body, goal, settings) with the weight history chart, and jumps to the
account card or push sending.

## Backend

- Base route: `/admin/soldiers` (backend Soldier module)
- Endpoints used: `GET /admin/soldiers` (paged; `Search`, `Gender`, `Goal`, `ExperienceLevel`,
  `IsHomeWorkout`, `CreatedFrom`, `CreatedTo`), `GET /admin/soldiers/{userId}`,
  `GET /admin/soldiers/{userId}/weight-history`
- Access (backend policy): `Policies.Admin`
- Error codes handled: `Profile.NotFound` → `SoldiersService.findProfile` returns `null` and the card
  shows "Onboarding tugatilmagan" with a link to the account card

## Screens

| Route               | Page                  | Access                   |
| ------------------- | --------------------- | ------------------------ |
| `/soldiers`         | `pages/soldiers-page` | `authGuard` (admin role) |
| `/soldiers/:userId` | `pages/soldier-page`  | `authGuard` (admin role) |

## Structure notes

- Everything is keyed by `userId` (Keycloak `sub`), never by the profile id.
- `models/soldier-facts.ts` turns a profile into labelled sections, so the card template only loops.
- `models/soldier-filter.ts` `toJoinedPeriod` makes the picked last day inclusive: `CreatedTo` is a
  strict `<`, so the panel sends the start of the next local day.
- `models/weight-chart.ts` computes the SVG geometry (no chart library); the target weight is drawn
  as a dashed line and widens the range when it lies outside the logged weights.
- Soldier data is read-only in the panel by decision (backend-requests "Kerak emas").

- `toSoldierFactSections(profile, now, locale)` builds the card texts with the pure `translate()` from `core/i18n`, so the model stays free of Angular (2026-09-19, i18n).

## Traps

- Soldiers without a body or goal profile have `null` goal, experience, weights and place.
  With `desc` sorting the backend puts `null`s first.
- The backend can return `gender: 0` (the profile commands do not validate `Gender`; a profile created
  without it stores `0`), and such a profile can also carry `dateOfBirth` `1970-01-01`. The mapper reads
  every soldier enum with `toDomainOrNull`, so an unknown value shows `—` instead of failing the whole
  list. The real fix is `IsInEnum` validation on the backend.
- `trainingDays` uses .NET `DayOfWeek` (0 = Sunday); the card lists them from Monday.
