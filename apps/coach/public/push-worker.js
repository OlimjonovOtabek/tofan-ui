const PUSH_RECEIVED = 'push-received';
const PUSH_OPEN = 'push-open';
const ICON = '/favicon.svg';

function readPayload(event) {
  try {
    return event.data ? event.data.json() : {};
  } catch {
    return {};
  }
}

function windows() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
}

function tell(client, kind, data, notice) {
  client.postMessage({ kind, data: JSON.stringify(data), ...notice });
}

function noticeOf(payload) {
  const data = payload.data ?? {};
  const notification = payload.notification ?? {};
  const title = notification.title ?? data.title;
  return title ? { title, body: notification.body ?? data.body ?? '' } : null;
}

async function deliver(payload) {
  const data = payload.data ?? {};
  const notice = noticeOf(payload);
  const open = await windows();
  const visible = open.find((client) => client.visibilityState === 'visible');
  if (visible) {
    tell(visible, PUSH_RECEIVED, data, notice);
    return;
  }
  if (notice) {
    await self.registration.showNotification(notice.title, {
      body: notice.body,
      icon: ICON,
      data,
    });
  }
}

async function openFrom(data) {
  const [client] = await windows();
  if (client) {
    await client.focus();
    tell(client, PUSH_OPEN, data);
    return;
  }
  await self.clients.openWindow(`/?push=${encodeURIComponent(JSON.stringify(data))}`);
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => event.waitUntil(deliver(readPayload(event))));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(openFrom(event.notification.data ?? {}));
});
