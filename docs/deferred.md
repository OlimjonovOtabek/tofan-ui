# Deferred work and known traps

| Date | Area | Note | Why deferred |
|---|---|---|---|
| 2026-09-16 | Keycloak | For the planned OIDC login the realm needs a public client `tofan-admin` (standard flow, PKCE S256, redirect URIs `http://localhost:4200/*` and the panel domain, web origins `+`) with the `admin` realm role mapped into the token | Realm configuration is infrastructure, not panel code |
| 2026-09-16 | Backend security | `GET /files`, `DELETE /files/{id}` require only authentication: any app user can list and delete every file | Backend change (`Policies.Admin` or an owner check) |
| 2026-09-16 | Backend security | Access tokens live 90 days; an `admin` token leaked (valid until 2026-11-26); no brute-force protection; Portainer, pgAdmin and Swagger are public | Backend `deferred.md` items 1.2, 1.4, 1.8, 1.9 |
| 2026-09-16 | Backend contract | Validation errors carry the FluentValidation validator code, not the property name, so they cannot be shown next to a form field | Needs `ValidationPipelineBehavior` to send `PropertyName` |
| 2026-09-16 | Users | Admin user management needs backend endpoints (`/admin/users`, roles, activation) built on the existing `IIdentityProviderClient`; the panel must not reach Keycloak's Admin API instead | Backend work, roadmap phase 2 |
| 2026-09-16 | Users | There is no admin user list endpoint; push sending takes a user id typed in or opened from the login journal | Roadmap phase 2, backend `User` module is empty |
| 2026-09-16 | Users | A session record has no device and is not closed by a plain logout; the journal must not call records "active" | Backend `UserSession` model |
| 2026-09-16 | Trap: paging | `SortField` must be snake_case or the backend silently sorts by `id` (fixed in `core/http/paging.mapper.ts`, easy to reintroduce) | Backend `PagingRequest<T>` |
| 2026-09-16 | Trap: storage | The backend deletes a file without checking references; the media page checks exercise videos first | Backend has no reference lookup |
