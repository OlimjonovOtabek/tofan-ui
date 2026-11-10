# Coach app

## Purpose

The coach app (`apps/coach`) is the web version of the Flutter coach app `tofan_trainer`.
The mobile `lib/` folder is the specification: screens, flows, texts (`lib/l10n/*.arb`), design tokens and components.
Coach access requires the `trainer` role.
The backend needs a trainer card before profile data is available; without one the guard sends the coach to `/onboarding`.

## Navigation

Five tabs, in this order: Dashboard (`/dashboard`), Programs (`/programs`), Clients (`/clients`), Chat (`/chat`), Profile (`/profile`).
Desktop shows a left sidebar.
Phone width (below 992px) shows the floating bottom tab bar.
A route marked with `data: { pushed: true }` hides the tab bar, like a pushed screen on mobile.
The Content tab (own exercises and foods) is hidden, as on mobile.

## Screens

| Area | Routes | Backend |
|---|---|---|
| Sign-in | `/auth/login` | `/auth/login` |
| Dashboard | `/dashboard` | `GET /coach/dashboard` |
| Programs | `/programs?kind=workout\|meal` | `/coach/workout-programs`, `/coach/meal-programs` |
| Workout program | `/programs/workout/new`, `:id`, `:id/edit` | create, read, update, delete, publish, `days`, `days/order` |
| Meal program | `/programs/meal/new`, `:id`, `:id/edit` | same shape, plus `GET /diet/foods` for the food picker |
| Clients | `/clients?filter=`, `/clients/:userId` | `/coach/clients`, `adherence`, `workout-sessions`, `nutrition`, `payments` |
| Chat | `/chat`, `/chat/c/:conversationId`, `/chat/with/:userId` | `/chat/conversations`, SignalR hub `/hubs/chat` |
| Profile | `/profile`, `edit`, `pricing`, `earnings`, `preview-videos` | `/coach/profile`, `/coach/earnings`, `/coach/preview-videos`, `/files` |

## Rules taken from mobile

- A workout day is a title, a description and an ordered list of uploaded videos (`{ fileId, name }`).
  Each video is one exercise. The day is saved only when the title is set and every video finished uploading.
  Days that came from the older exercise-based editor lose their exercises without a video when saved (the editor warns).
- A program has up to 7 days. Only one workout and one meal program is published at a time per the backend.
  A published program can only be deleted after it is unpublished.
- A meal has numbered options (`optionNumber`), shown one per day in rotation.
  The totals card counts the first option of each meal.
- Client adherence is graded high (85+), good (70+) or low. Low shows the needs-review tag.
  Low activity means no workout for 7 days or ever. Ended subscriptions skip activity sections.
- Client Tier: `GET /coach/clients` carries `tier` (`1` Standard, `2` VIP), mapped with the shared `tiers` enum map from `@shared/models/tier.dto`.
  A backend without `tier` (production before the release day) maps to Standard, so the panel keeps working.
  VIP Clients get a VIP tag (`coachApp.clients.tierVip`) in the Clients row and next to the goal tag on the Client page.
  `GET /coach/clients/{userId}` has no tier and no subscription data, so the Client page takes the Tier from the list summary, like it already does for the subscription.
  A Client can be messaged only when the subscription is not ended and the Tier is VIP (`canMessage` in `core/clients/client.ts`; an expiring subscription still can).
  The write button on the Client page and its sticky footer follow that rule, so a Standard or ended Client shows no button.
- Preview videos: at most 5, can be reordered by drag.
- Processing status comes from `GET /files/videos` and is polled every 5 seconds while a video is pending.
- Pricing (`/profile/pricing`) has the monthly price and an optional VIP price, as on mobile.
  An empty VIP field means `null`: no new VIP sales, and current VIP subscribers keep chat until their subscription ends.
  A VIP price of zero is refused before saving (`coachApp.pricing.vipInvalid`).
  The profile row shows `200 000 UZS / oy · VIP 400 000` when the coach sells VIP (`profilePriceLabel`, same number format and unit as the monthly price, VIP part from `coachApp.profile.vipPrice`).
- `vipMonthlyPrice` is always in the `PUT /coach/profile` body, as a number or `null`, unlike `monthlyPrice`, `bio`, `photoFileId` and `slug`, which are left out when empty.
  The backend wipes the VIP price when the key is missing or `null`, so every save (name, bio, link, photo, prices) goes through `toCoachProfileChange`, which copies the current VIP price from the loaded profile.
  Never build an `UpdateCoachProfileRequest` by hand and never make `vipMonthlyPrice` optional in `CoachProfileChange`.

## Video uploads

Program days and preview videos go through `VideoUploadsStore` (`core/videos`), which is global so an upload outlives the screen that started it.
It follows the mobile `VideoUploadManager` on the `dev` branch of `tofan_trainer`.
Avatars and other images stay on the shared multipart `FileUploadService`.

- **Limit:** 1 GB per video, checked after compression. The server answers `StoredFile.TooLarge` above it.
- **Transport:** tus on `/files/uploads` in 8 MB chunks, then `POST /files/uploads/{id}/complete`. `POST /files/uploads` is not in Swagger; the contract comes from the mobile client.
- **Resume:** a dropped chunk is retried up to 5 times with a growing wait, after reading the offset with `HEAD`. A retry of the same file continues from the server's offset. The open upload is kept in memory, so closing the tab starts it again.
- **Progress:** it moves per chunk, because `withFetch()` reports no upload progress inside a request.
- **Compression:** `video-compressor.service.ts` makes a copy with Mediabunny (WebCodecs) in the origin private file system: at most 1920 on the longer side, 30 fps, 8 Mbit/s H.264, 128 kbit/s AAC, MP4. A video at most 1080p and 200 MB is sent as it is. Any failure, or a copy that is not smaller, sends the source. HDR sources are sent untouched, because the browser has no tone mapping like the mobile iOS transcoder.
- **Queued saves:** a day can be saved while its videos upload. `saveWhenUploaded` sends the day, the new program or the preview video once they are stored, and gives the save up when one of them is lost. `VideoUploadBar` in the shell shows the progress and leads to the screen.
- **Leaving:** `programLeaveGuard` and the back button save a day that can be saved. Otherwise they ask first (`Upload will stop` or `Discard changes?`) and stop the uploads of that edit. `beforeunload` warns while anything uploads, because a closed tab stops the uploads, unlike the mobile background upload.

## Chat

Only a Client with an active VIP Tier can be written to.
A conversation with anyone else stays readable but is read-only.

- **Read-only state:** `ConversationStore.canWrite` is false.
  The composer is replaced by a lock note that says chat is open only to athletes with an active VIP subscription and that the history stays (`coachApp.conversation.readOnly`).
  The "No messages yet" invitation is hidden in this state.
- **Open refused:** `POST /chat/conversations/with/{userId}` answers `403 Chat.SubscriptionRequired` when the Client is not an active VIP.
  The store treats it as the read-only state, not as a load error: no history is loaded, `loadError` stays empty, the name from the `?name=` query stays in the header.
  Any other failure still shows the error state with retry.
- **Send refused:** `POST /chat/conversations/{id}/messages` can answer the same 403 when the Client lost VIP after the conversation was opened.
  `ChatOutboxStore` asks `ConversationStore.refused` to switch to read-only, shows the toast `errors.backend.Chat.SubscriptionRequired` and returns `false`.
  `ChatComposerStore` puts the text back into its draft when a send returns `false`, so nothing the coach typed is lost.
- **Unsent text:** while the conversation is read-only and the draft has text, the lock note is preceded by a muted block with the label `coachApp.conversation.unsent` and the draft as plain, selectable text (line breaks kept), so the coach can copy it.
  The rule is `unsentText(draft, canWrite)` in `models/chat-access.ts`; nothing is shown for an empty or whitespace-only draft or while the conversation is writable.
  The draft lives in `ChatComposerStore`, provided by the page, so when the conversation turns writable again the composer comes back with the same text.
- **Recognising the refusal:** `models/chat-access.ts` matches the backend code `Chat.SubscriptionRequired`, never the message text.
  The code reaches the store because the shared HTTP layer keeps it on `AccessDeniedError` (see `docs/backend-contract.md`).
- **Existing conversations:** the list and `GET /chat/conversations` carry `canWrite` per conversation, which feeds the same read-only state.

### Chat v2: images, files, voice and video notes

Backend contract: `.scratch/chat-v2/backend-chat-v2.md` (stage API v9.19).
A message has a `kind` (`text`, `image`, `file`, `voice`, `videoNote`) and `attachments`; `text` is an empty string for media without a caption.

- **Stores on the conversation page:** `ConversationStore` (history, peer, links), `ChatOutboxStore` (text send, uploads and pending bubbles), `ChatComposerStore` (draft, picked files), `VoiceRecordingStore` (microphone session) and `ChatPlaybackStore` (only one voice or video plays with sound at a time); `locateConversation` opens or finds the conversation before the history loads.
- **Sending media:** every file goes to `POST /files` through the shared `FileUploadService` (category `chatImage` 8, `chatFile` 11, `chatVoice` 9), then the message is sent with `{ text, attachments: [fileId] }`.
  Images and files are picked from the attach menu, 1 to 10 per message; the two kinds never mix (`Chat.AttachmentsMixed`), so the menu only opens while nothing is picked and a pasted image joins the image tray.
  Extensions and sizes are checked in the browser with `ensureUploadIsAllowed` before the upload; the backend still decides.
  The message shows at once as a pending bubble with the combined progress; a failure keeps it with retry and discard, and discard cancels the uploads.
- **Scroll after sending:** every send (text, images or files, voice) scrolls the list to the newest message, even when the coach had scrolled up.
  `ChatOutboxStore.outgoingRevision` grows when a send starts and again when the sent message is shown, and the page scrolls on each change.
  The second scroll is needed because the reply often arrives while the first smooth scroll is still running, which left the list one bubble above the bottom.
- **Voice:** a click on the microphone starts `MediaRecorder` (webm/opus in Chrome and Firefox, mp4 in Safari, ogg as a fallback) and the file is named `voice.webm`, `voice.m4a` or `voice.ogg` so the backend accepts the extension.
  The send button finishes, the bin or Esc cancels, under 1 second is dropped with a toast, and recording stops on its own at 15 minutes.
  The live bars use a decibel scale (`levelFromRms`: -60 dB is empty, 0 dB is full) because a linear scale leaves normal speech near zero.
- **Showing media:** an image album reserves its height from `width`/`height` (one image) or fixed rows (2 to 10, `albumRows`) and opens a full screen `<dialog>` gallery with arrows, thumbnails and download.
  A file shows its extension badge, name and size and downloads through a fresh signed URL.
  A voice message shows 64 waveform bars, the elapsed part in the strong color, the time and a 1x/1.5x/2x speed toggle; the bars double as an invisible range input for seeking.
  A video note is a 208 px circle that plays muted in a loop; a click plays it from the start with sound and fills the progress ring.
  The `muted` state must be a property binding: a static `muted` attribute added by Angular does not mute the element, and Chrome then autoplays with sound.
- **Signed URLs:** the `url` of a file changes every hour.
  `mergeMessages` keeps the URL the page already has for a `fileId` while its `expires` is more than a minute away, so a reload of the history does not refetch every image.
  A media element that fails to load, or a file opened after its URL expired, makes `MediaLinks` refetch the 20 messages around that message (at most once a minute per message) and replace that message's URLs.
- **Activity:** the hub method `Activity(conversationId, activity)` replaces `Typing`: 1 while typing, 2 while recording voice, 4 while uploading, at most once per 3 seconds per activity (`shouldSendActivity`).
  `UserActivity` replaces `UserTyping`; the header and the conversation list show it for 5 seconds or until a message from that user arrives (`ActivityBoard`).
- **List preview:** `lastMessageKind` picks the icon (image, paperclip, microphone, video note) and, when `lastMessageText` is empty, the word for the kind (`previewText`).
- **Trap:** a CSS class called `ring` (and other Tailwind utility names) picks up the Tailwind utility; the progress circles use `progress-ring`.

## Push notifications

`core/push` registers the browser's Firebase token with `PUT /device-tokens/me` (`platform` 3, Web) and removes it on sign-out with `DELETE /device-tokens/me`.
The coach turns it on in Profile, since browsers ask for permission on a user action.
`public/push-worker.js` is a plain service worker without the Firebase SDK: it shows the notification, or tells a visible tab, and a tap opens the screen from `pushLinkOf` (the same routes as mobile).
A visible tab gets the push `data` plus its `title` and `body` (`toPushNotice`), and `PushStore` shows them in an info toast (`NotificationService.announce`).
A failed video push keeps its own localized toast, and a tap on a system notification opens the screen without showing the text again.
With the tab hidden the worker raises the system notification instead.
A push without a `title` (data only) is shown nowhere, in a visible tab or a hidden one.

The Firebase web app config is read at run time from `/push-config.json`, so one image works with the stage and the production Firebase projects.
The values are public identifiers, not secrets; the backend's service account key never goes into the panel.
- In the image, `nginx/push-config.sh` runs at container start (`/docker-entrypoint.d/40-push-config.sh`) and writes the file from `FIREBASE_PUBLIC_API_KEY`, `FIREBASE_APP_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_MESSAGING_SENDER_ID` and the optional `FIREBASE_PUBLIC_VAPID_KEY` (table in `docs/deployment.md`).
  An empty `FIREBASE_PROJECT_ID` writes `null` and hides push; a missing or malformed value stops the container with a clear message.
- On the dev server, `apps/coach/dev-public/push-config.json` holds the `tofan-dev` web app (`Tofan Coach Web Dev`), added only by the `development` build configuration.
  The file is git-ignored: copy `push-config.example.json` next to it and fill it from the Firebase console. Without it the dev server hides push, as on an image without `FIREBASE_*` env.
  Local push therefore works with the local and the stage backend, never with production, so no test device token reaches production data.
- The image has no Firebase defaults; both stacks set the env (`docs/deployment.md`). Values never go into git, because GitHub secret scanning flags the API key.
- `PushConfigService` loads the file once; `PushStore.start()` sets `supported` after it, so the Profile row appears only when the file has a full config.
- When the browser hands out a new token (for example after the Firebase project changed), `PushStore` registers the new token and removes the old one from the backend.
- No VAPID key is set, so the Firebase default key is used.

Stage runs on the `tofan-dev` project and production on `tofan-68065`.
A token from one project cannot be reached by the other project's sender, which is why push on stage stayed silent while the image carried the production config.

## Structure

```text
apps/coach/src/app/
  core/auth        coach profile guard
  core/layout      shell, navigation, links, preset (coach-theme.ts)
  core/ui          design system primitives (button, text-field, sheet, tiles, icons, ...)
  core/format      locale aware numbers, money and dates (Uzbek month names are written out)
  core/clients     client model and rules shared by dashboard, clients and profile
  core/payments    payment model and row
  core/videos      video status, tag, full screen player, tus uploads, compression and the upload queue
  core/push        browser push token and the screen a tapped push opens
  core/theme       light, dark, system theme store
  features/<x>     auth, dashboard, programs, clients, chat, profile
```

## Design system

Tokens come from the mobile `Palette`, `Dimensions` and Inter type scale.
Colors are defined in `core/layout/coach-theme.ts` (`semantic.colorScheme.light|dark.coach`) and exposed as `--c-*` custom properties in `styles.css`.
Shared classes (`c-card`, `c-tag`, `c-chip`, `c-button`, `c-pill`) live in `ui.css`.
Icons are the mobile SVGs in one sprite (`core/ui/icon/icon-sprite.html`), drawn with `currentColor`.
Mobile bottom sheets are `Sheets` (confirm, actions, choose, prompt): a bottom sheet on phones and a centered dialog from 768px.
The app also keeps Optimus UI for the toast host and the preset.

## Texts

All coach texts live in the `coachApp` section of the dictionary (`libs/core/src/i18n/translations/<lang>/coach-app.ts`).
They are ported from the mobile ARB files, including ICU plurals, which `interpolate` resolves with `Intl.PluralRules`.

## Operations

The SignalR chat connects through `API_BASE_URL + /hubs/chat`.
The dev proxies already forward WebSockets (`ws: true` for prod).
The production nginx (`nginx/default.conf.template`) forwards the `Upgrade` and `Connection` headers on `/api/`, so the hub works behind it.
The external TLS nginx in front of the swarm stack must forward them as well (`docs/deployment.md`).
