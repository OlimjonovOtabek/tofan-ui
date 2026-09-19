# Accounts feature

## Purpose

Technical list of every Keycloak account (including users who have not finished onboarding and
admins). The admin searches accounts, opens an account card, sees its realm roles, blocks or
unblocks it and signs the user out everywhere.

## Backend

- Base route: `/admin/users` (backend Auth module, reads Keycloak live)
- Endpoints used: `GET /admin/users` (paged; `Search`, `IsActive`, `Role`), `GET /admin/users/{id}`,
  `GET /admin/users/{id}/roles`, `POST /admin/users/{id}/block`, `POST /admin/users/{id}/unblock`,
  `POST /admin/users/{id}/logout-all`
- Access (backend policy): `Policies.Admin`
- Error codes handled: `User.NotFound`, `User.AlreadyBlocked`, `User.NotBlocked`,
  `User.CannotBlockSelf`, `GetUsersQuery` (500 when Keycloak cannot be read) — per-code messages in
  `core/feedback/error-message.ts`

## Screens

| Route               | Page                  | Access                   |
| ------------------- | --------------------- | ------------------------ |
| `/accounts`         | `pages/accounts-page` | `authGuard` (admin role) |
| `/accounts/:userId` | `pages/account-page`  | `authGuard` (admin role) |

## Structure notes

- `AccountsStore` serves the list, `AccountStore` the card. The card loads the account and its roles
  in parallel; roles are a separate endpoint, not a field of the account.
- `AccountStore.run(action)` maps `block` / `unblock` / `logoutEverywhere` to service calls through a
  strategy map and always reloads the card afterwards: `isActive` is read back from Keycloak.
- The block button is disabled for the signed-in admin's own account (`AuthStore.currentUser().id`);
  blocking another admin asks for confirmation with an extra warning.
- The card links to `/soldiers/:userId`, `/user-sessions?userId=` and `/notifications/send?userId=`.
  These are route links, not feature imports.

## Traps

- The list ignores `sortField` / `sortOrder` and always sorts by username; columns are not sortable.
- `Role=admin` answers 500 until the `tofan-api` service account gets `realm-management/view-realm`.
- `phoneNumber` stays `null` until the realm User Profile declares `phone_number`.
- A blocked user keeps using the API until the access token in hand expires (90 days today). The
  card says so next to the buttons; do not remove the note until the backend shortens token lifetime.
