# Auth feature

## Purpose
Sign-in for admins and the pages around it: login, access denied, error. The session logic itself
lives in `core/auth`; this feature only holds the pages.

## Backend
- Base route: `/auth`
- Endpoints used: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` (Keycloak tokens)
- Access (backend policy): anonymous for login and refresh
- Error codes handled: `Authentication.InvalidCredentials`, `Authentication.InvalidRefreshToken`

## Screens
| Route | Page | Access |
|---|---|---|
| `/auth/login` | `pages/login-page` | `guestGuard` (redirects to `/` when a session exists) |
| `/auth/access-denied` | `pages/access-denied-page` | open |
| `/auth/error` | `pages/error-page` | open |

## Structure notes
- `AuthStore.login` rejects accounts without the `admin` realm role and revokes their fresh session.
- The session (access and refresh token with expiry dates) is kept in `localStorage` by
  `AuthSessionStorage`; the profile is read from the access token claims (`sub`,
  `preferred_username`, `name`, `realm_access.roles`), there is no `/auth/me`.
- `session.interceptor.ts` refreshes once on 401 (parallel requests share one refresh) and signs out
  when the refresh fails; 403 navigates to access denied.
- The login page accepts `returnUrl` and only follows same-origin paths.

## Traps
- A planned move to the Keycloak login page (OIDC + PKCE) replaces `AuthService` and the login page;
  keep token handling inside `core/auth` so features are not affected.
- Never call the Keycloak Admin API from the panel (CLAUDE.md §8).
