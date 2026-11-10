# User sessions feature

## Purpose

A read-only login journal: which user signed in when, from which device and address, until when the
token lives and whether the user signed out everywhere. The admin can search by username, filter by
status and login date, narrow the journal to one user, open that account card, copy a user id or open
push sending for that user.

## Backend

- Base route: `/user-sessions` (backend Auth module)
- Endpoints used: `GET /user-sessions` (paged; `UserId`, `Search` (username), `Status` (`1` active, `2` revoked, `3` expired), `CreatedFrom`, `CreatedTo`); rows carry `userName`, `ipAddress` and the raw `userAgent` (API v9.20)
- Access (backend policy): `Policies.Admin`
- Error codes handled: none specific

## Screens

| Route                     | Page                       | Access                   |
| ------------------------- | -------------------------- | ------------------------ |
| `/user-sessions?userId=…` | `pages/user-sessions-page` | `authGuard` (admin role) |

## Structure notes

- `UserSession.status(now)` gives `unexpired`, `expired` or `revokedEverywhere`.
- `toSessionDevice` (`models/session-device.ts`) turns the raw user agent into a short name:
  `Tofan/9.19 (iPhone; iOS 19.1)` becomes "Tofan 9.19 · iPhone · iOS 19.1", browsers become "Chrome · macOS",
  scripts keep their first token ("Python-urllib/3.9"), and a missing agent reads "No data".
  The raw agent stays in the cell tooltip.
- `UserSessionsStore` keeps the `?userId=` filter from the link apart from the list filter of
  `components/user-session-filters`, so changing one keeps the other.
- The "send push" link opens `/notifications/send?userId=…`; the send page reads it through
  component input binding. This is route navigation, not a feature import.

## Traps

- This is not a list of active sessions: a record is created at login/register, refresh adds none,
  a plain logout does not change it, only logout-all sets `isRevoked`. Never label records "active".
- Sessions created before API v9.20 have no `userName`, `ipAddress` or `userAgent`; the user column shows
  the short user id and the device column "No data", and `Search` does not find them.
- The mobile app sends the default `Dart/3.11 (dart:io)` agent, so its sessions read "Tofan app" with no
  device or system until the app names itself (`Tofan/<version> (<device>; <system>)`).
- `Status=1` (active) means the access token has not expired yet (30 minutes after login; refresh does not
  move `expiresOnUtc`), not a signed-in device. Do not present it as "online".
- There is no full name and no last-used time in the response.
- The user filter lives in the URL (`?userId=`, read through input binding). `UserSessionsStore.filterByUser`
  only remembers the filter before the table's first lazy load, so the first page is requested once.
  An id that is not a UUID is ignored.
