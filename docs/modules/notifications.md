# Notifications feature

## Purpose
The admin manages push notification templates (type × trainer style, three languages) and sends a
push to one user, either from templates or with custom text and an optional key–value payload.

## Backend
- Base routes: `/notification-templates`, `/notifications` (backend Notification module)
- Endpoints used: `GET/POST /notification-templates`, `PUT/DELETE /notification-templates/{id}`,
  `POST /notifications/templated`, `POST /notifications/custom`
- Access (backend policy): `Policies.Admin`
- Error codes handled (per-code text in `core/feedback/error-message.ts`): `NotificationTemplate.Conflict`,
  `NotificationTemplate.NoActiveTemplate`, `NotificationPreference.Disabled`,
  `PushNotification.NoActiveDevice`, `PushNotification.DispatchFailed`, `PushNotification.Disabled`,
  `PushNotification.ConfigurationInvalid`, `UserId.Empty`, `UserId.Invalid`, `Data.KeyEmpty`, `Data.KeyDuplicate`

## Screens
| Route | Page | Access |
|---|---|---|
| `/notifications/templates` | `pages/notification-templates-page` | `authGuard` (admin role) |
| `/notifications/send` | `pages/send-notification-page` | `authGuard` (admin role) |

## Structure notes
- `NotificationTemplatesStore` serves the templates screen, `NotificationSendStore` the send screen
  (it loads all templates once to show coverage and a preview).
- `components/template-coverage-hint` explains which trainer styles have an active template;
  `components/notification-data-entries` edits the payload rows.
- `models/outgoing-notification.ts` validates the recipient (UUID), text limits and payload keys
  before the confirmation dialog, so an invalid push never reaches the confirm step.

## Traps
- The backend allows one active template per type and style (409 `NotificationTemplate.Conflict`).
- For a templated push the backend picks the user's style and falls back to `professional`; without an
  active professional template some users get nothing.
- Sending targets one user id typed in or opened from the login journal; there is no user list and
  no bulk send endpoint.
