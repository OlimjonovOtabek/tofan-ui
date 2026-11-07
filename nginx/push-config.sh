#!/bin/sh
set -eu

target=/usr/share/nginx/html/push-config.json

if [ -z "${FIREBASE_PROJECT_ID:-}" ]; then
  printf 'null\n' > "$target"
  exit 0
fi

api_key="${FIREBASE_PUBLIC_API_KEY:?FIREBASE_PUBLIC_API_KEY is required when FIREBASE_PROJECT_ID is set}"
app_id="${FIREBASE_APP_ID:?FIREBASE_APP_ID is required when FIREBASE_PROJECT_ID is set}"
sender_id="${FIREBASE_MESSAGING_SENDER_ID:?FIREBASE_MESSAGING_SENDER_ID is required when FIREBASE_PROJECT_ID is set}"
vapid_key="${FIREBASE_PUBLIC_VAPID_KEY:-}"

for value in "$api_key" "$app_id" "$FIREBASE_PROJECT_ID" "$sender_id" "$vapid_key"; do
  case "$value" in
    *[!A-Za-z0-9:._-]*)
      echo "push-config: Firebase values may only contain letters, digits and : . _ -" >&2
      exit 1
      ;;
  esac
done

vapid_field=""
if [ -n "$vapid_key" ]; then
  vapid_field=$(printf ',"vapidKey":"%s"' "$vapid_key")
fi

printf '{"apiKey":"%s","appId":"%s","projectId":"%s","messagingSenderId":"%s"%s}\n' \
  "$api_key" "$app_id" "$FIREBASE_PROJECT_ID" "$sender_id" "$vapid_field" > "$target"
