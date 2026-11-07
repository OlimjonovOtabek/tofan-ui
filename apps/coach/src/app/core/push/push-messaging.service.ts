import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PUSH_CONFIG, PushConfig } from './push-config';
import { PushData, toPushData } from './push-message';

const WORKER_PATH = '/push-worker.js';
const WORKER_PUSH_KIND = 'push-received';
const WORKER_OPEN_KIND = 'push-open';

export interface WorkerPushEvent {
  readonly opened: boolean;
  readonly data: PushData;
}

@Injectable({ providedIn: 'root' })
export class PushMessagingService {
  private readonly config = inject(PUSH_CONFIG);

  get supported(): boolean {
    return (
      this.config !== null &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  get permission(): NotificationPermission {
    return Notification.permission;
  }

  requestPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
  }

  async createToken(): Promise<string> {
    const { getToken, messaging, config } = await this.loadMessaging();
    const registration = await navigator.serviceWorker.register(WORKER_PATH);
    await navigator.serviceWorker.ready;
    return getToken(messaging, {
      serviceWorkerRegistration: registration,
      ...(config.vapidKey === undefined ? {} : { vapidKey: config.vapidKey }),
    });
  }

  async removeToken(): Promise<void> {
    const { deleteToken, messaging } = await this.loadMessaging();
    await deleteToken(messaging);
  }

  workerEvents(): Observable<WorkerPushEvent> {
    return new Observable((subscriber) => {
      if (!('serviceWorker' in navigator)) {
        return;
      }
      const listener = (event: MessageEvent<unknown>) => {
        const message = toPushData(event.data);
        const kind = message['kind'];
        if (kind === WORKER_PUSH_KIND || kind === WORKER_OPEN_KIND) {
          subscriber.next({
            opened: kind === WORKER_OPEN_KIND,
            data: toPushData(JSON.parse(message['data'] ?? '{}') as unknown),
          });
        }
      };
      navigator.serviceWorker.addEventListener('message', listener);
      return () => navigator.serviceWorker.removeEventListener('message', listener);
    });
  }

  private async loadMessaging() {
    const config = this.requireConfig();
    const [{ getApps, initializeApp }, { deleteToken, getMessaging, getToken }] = await Promise.all(
      [import('@firebase/app'), import('@firebase/messaging')],
    );
    const app = getApps()[0] ?? initializeApp(config);
    return { config, deleteToken, getToken, messaging: getMessaging(app) };
  }

  private requireConfig(): PushConfig {
    if (this.config === null) {
      throw new Error('Push notifications are not configured.');
    }
    return this.config;
  }
}
