# User sessions feature

## Purpose
A read-only login journal: which user id signed in when, until when the token lives and whether the
user signed out everywhere. The admin can copy a user id or open push sending for that user.

## Backend
- Base route: `/user-sessions` (backend Auth module)
- Endpoints used: `GET /user-sessions` (paged)
- Access (backend policy): `Policies.Admin`
- Error codes handled: none specific

## Screens
| Route | Page | Access |
|---|---|---|
| `/user-sessions` | `pages/user-sessions-page` | `authGuard` (admin role) |

## Structure notes
- `UserSession.status(now)` gives `unexpired`, `expired` or `revokedEverywhere`.
- The "send push" link opens `/notifications/send?userId=…`; the send page reads it through
  component input binding. This is route navigation, not a feature import.

## Traps
- This is not a list of active sessions: a record is created at login/register, refresh adds none,
  a plain logout does not change it, only logout-all sets `isRevoked`. Never label records "active".
- Records carry no device and no user name; there is no filter by user.
